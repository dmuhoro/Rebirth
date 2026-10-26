package com.dmuhoro.rebirth;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.util.Log;
import androidx.annotation.Nullable;
import java.text.BreakIterator;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.json.JSONObject;

public final class BackgroundNarrationService extends Service implements TextToSpeech.OnInitListener {
    public static final String ACTION_EVENT = "com.dmuhoro.rebirth.NARRATION_EVENT";
    public static final String ACTION_PLAY = "com.dmuhoro.rebirth.PLAY";
    public static final String ACTION_PAUSE = "com.dmuhoro.rebirth.PAUSE";
    public static final String ACTION_RESUME = "com.dmuhoro.rebirth.RESUME";
    public static final String ACTION_STOP = "com.dmuhoro.rebirth.STOP";
    public static final String ACTION_SKIP_FORWARD = "com.dmuhoro.rebirth.SKIP_FORWARD";
    public static final String ACTION_SKIP_BACKWARD = "com.dmuhoro.rebirth.SKIP_BACKWARD";
    public static final String ACTION_SET_RATE = "com.dmuhoro.rebirth.SET_RATE";
    public static final String EXTRA_EVENT_NAME = "eventName";
    public static final String EXTRA_EVENT_DATA = "eventData";
    public static final String EXTRA_TEXT = "text";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_SUBTITLE = "subtitle";
    public static final String EXTRA_RATE = "rate";
    public static final String EXTRA_SESSION_ID = "sessionId";

    private static final String CHANNEL_ID = "rebirth_audio";
    private static final int NOTIFICATION_ID = 4107;
    private static final int MAX_CHUNK_LENGTH = 280;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final List<String> chunks = new ArrayList<>();

    private TextToSpeech textToSpeech;
    private MediaSession mediaSession;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private String title = "Rebirth narration";
    private String subtitle = "Rebirth";
    private int chunkIndex;
    private int charIndex;
    private int generation;
    private float rate = 1.0f;
    private int sessionId;
    private int utteranceStartCharIndex;
    private boolean engineReady;
    private boolean paused;
    private boolean playbackRequested;
    private boolean foreground;
    private boolean hasAudioFocus;
    private boolean resumeOnAudioFocusGain;
    private final AudioManager.OnAudioFocusChangeListener audioFocusChangeListener =
        this::onAudioFocusChanged;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        createMediaSession();
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        textToSpeech = new TextToSpeech(this, this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getAction() == null) return START_NOT_STICKY;
        String action = intent.getAction();
        switch (action) {
            case ACTION_PLAY:
                startForegroundPlayback(intent);
                break;
            case ACTION_PAUSE:
                pausePlayback();
                break;
            case ACTION_RESUME:
                resumePlayback();
                break;
            case ACTION_STOP:
                stopPlayback(true);
                break;
            case ACTION_SKIP_FORWARD:
                skip(1);
                break;
            case ACTION_SKIP_BACKWARD:
                skip(-1);
                break;
            case ACTION_SET_RATE:
                setSpeechRate(intent.getFloatExtra(EXTRA_RATE, rate));
                break;
            default:
                return START_NOT_STICKY;
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            fail("Android text-to-speech could not be initialized.");
            return;
        }

        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                if (isCurrentUtterance(utteranceId)) publishProgress();
            }

            @Override
            public void onDone(String utteranceId) {
                if (!isCurrentUtterance(utteranceId)) return;
                charIndex = chunks.get(chunkIndex).length();
                advanceChunk();
            }

            @Override
            public void onError(String utteranceId) {
                if (isCurrentUtterance(utteranceId)) {
                    fail("Android text-to-speech stopped unexpectedly.");
                }
            }

            @Override
            public void onRangeStart(
                String utteranceId,
                int start,
                int end,
                int frame
            ) {
                if (!isCurrentUtterance(utteranceId) || chunks.isEmpty()) return;
                charIndex = Math.min(
                    chunks.get(chunkIndex).length(),
                    utteranceStartCharIndex + end
                );
                publishProgress();
            }
        });

        Voice offlineVoice = findOfflineEnglishVoice();
        if (offlineVoice == null) {
            fail("Install an offline English voice in Android speech settings to play private narration.");
            return;
        }
        if (textToSpeech.setVoice(offlineVoice) != TextToSpeech.SUCCESS
            || textToSpeech.setSpeechRate(rate) != TextToSpeech.SUCCESS) {
            fail("The installed offline voice could not be selected.");
            return;
        }

        engineReady = true;
        if (playbackRequested && !paused) speakCurrentChunk();
    }

    private Voice findOfflineEnglishVoice() {
        Set<Voice> voices = textToSpeech.getVoices();
        if (voices == null) return null;
        for (Voice voice : voices) {
            Locale locale = voice.getLocale();
            if (locale != null
                && "en".equalsIgnoreCase(locale.getLanguage())
                && !voice.isNetworkConnectionRequired()) {
                return voice;
            }
        }
        return null;
    }

    private void startForegroundPlayback(Intent intent) {
        String text = intent.getStringExtra(EXTRA_TEXT);
        if (text == null || text.trim().isEmpty()) {
            stopSelf();
            return;
        }

        title = safeNotificationText(intent.getStringExtra(EXTRA_TITLE), "Rebirth narration");
        subtitle = safeNotificationText(intent.getStringExtra(EXTRA_SUBTITLE), "Rebirth");
        rate = clampRate(intent.getFloatExtra(EXTRA_RATE, 1.0f));
        sessionId = intent.getIntExtra(EXTRA_SESSION_ID, sessionId + 1);
        chunks.clear();
        chunks.addAll(splitIntoChunks(text));
        chunkIndex = 0;
        charIndex = 0;
        generation++;
        paused = false;
        playbackRequested = true;
        startForeground(NOTIFICATION_ID, buildNotification());
        foreground = true;
        mediaSession.setActive(true);
        updateMediaSession(PlaybackState.STATE_PLAYING);
        publishState("playing", false, null, false);
        if (engineReady) speakCurrentChunk();
    }

    private void speakCurrentChunk() {
        if (!engineReady || !playbackRequested || paused) return;
        if (chunkIndex >= chunks.size()) {
            finishPlayback();
            return;
        }
        if (!requestAudioFocus()) return;

        String source = chunks.get(chunkIndex);
        if (charIndex >= source.length()) charIndex = 0;
        String remaining = source.substring(charIndex);
        if (remaining.isEmpty()) {
            advanceChunk();
            return;
        }

        int activeGeneration = ++generation;
        String utteranceId = activeGeneration + ":" + chunkIndex;
        utteranceStartCharIndex = charIndex;
        int status = textToSpeech.speak(
            remaining,
            TextToSpeech.QUEUE_FLUSH,
            null,
            utteranceId
        );
        if (status == TextToSpeech.ERROR) {
            fail("Android could not start narration.");
            return;
        }
        updateMediaSession(PlaybackState.STATE_PLAYING);
        publishState("playing", false, null, false);
        updateNotification();
    }

    private void pausePlayback() {
        if (!playbackRequested) return;
        resumeOnAudioFocusGain = false;
        if (paused) return;
        pausePlaybackForAudioFocusLoss();
    }

    private void pausePlaybackForAudioFocusLoss() {
        if (!playbackRequested || paused) return;
        paused = true;
        generation++;
        textToSpeech.stop();
        updateMediaSession(PlaybackState.STATE_PAUSED);
        publishState("paused", true, null, false);
        updateNotification();
    }

    private void resumePlayback() {
        if (!playbackRequested || !paused) return;
        resumeOnAudioFocusGain = false;
        paused = false;
        speakCurrentChunk();
    }

    private void stopPlayback(boolean publish) {
        playbackRequested = false;
        paused = false;
        resumeOnAudioFocusGain = false;
        generation++;
        if (textToSpeech != null) textToSpeech.stop();
        updateMediaSession(PlaybackState.STATE_STOPPED);
        mediaSession.setActive(false);
        abandonAudioFocus();
        if (publish) publishState("idle", false, null, false);
        stopForeground(STOP_FOREGROUND_REMOVE);
        foreground = false;
        stopSelf();
    }

    private void skip(int direction) {
        if (!playbackRequested || chunks.isEmpty()) return;
        chunkIndex = Math.max(0, Math.min(chunks.size() - 1, chunkIndex + direction));
        charIndex = 0;
        generation++;
        textToSpeech.stop();
        paused = false;
        speakCurrentChunk();
    }

    private void setSpeechRate(float requestedRate) {
        rate = clampRate(requestedRate);
        if (textToSpeech == null) return;
        textToSpeech.setSpeechRate(rate);
        if (playbackRequested && !paused) {
            generation++;
            textToSpeech.stop();
            speakCurrentChunk();
        }
    }

    private void advanceChunk() {
        chunkIndex++;
        charIndex = 0;
        if (chunkIndex >= chunks.size()) {
            finishPlayback();
        } else {
            publishProgress();
            handler.postDelayed(this::speakCurrentChunk, 320);
        }
    }

    private void finishPlayback() {
        playbackRequested = false;
        paused = false;
        resumeOnAudioFocusGain = false;
        generation++;
        updateMediaSession(PlaybackState.STATE_STOPPED);
        mediaSession.setActive(false);
        abandonAudioFocus();
        publishProgress(true);
        publishState("idle", false, null, true);
        stopForeground(STOP_FOREGROUND_REMOVE);
        foreground = false;
        stopSelf();
    }

    private boolean isCurrentUtterance(String utteranceId) {
        if (utteranceId == null || chunks.isEmpty()) return false;
        String[] values = utteranceId.split(":", 2);
        if (values.length != 2) return false;
        try {
            return Integer.parseInt(values[0]) == generation
                && Integer.parseInt(values[1]) == chunkIndex
                && playbackRequested
                && !paused;
        } catch (NumberFormatException error) {
            return false;
        }
    }

    private void fail(String message) {
        playbackRequested = false;
        paused = false;
        resumeOnAudioFocusGain = false;
        generation++;
        if (textToSpeech != null) textToSpeech.stop();
        updateMediaSession(PlaybackState.STATE_ERROR);
        mediaSession.setActive(false);
        abandonAudioFocus();
        publishState("idle", false, message, false);
        stopForeground(STOP_FOREGROUND_REMOVE);
        foreground = false;
        stopSelf();
    }

    private void createMediaSession() {
        mediaSession = new MediaSession(this, "RebirthNarration");
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() {
                resumePlayback();
            }

            @Override
            public void onPause() {
                pausePlayback();
            }

            @Override
            public void onStop() {
                stopPlayback(true);
            }

            @Override
            public void onSkipToNext() {
                skip(1);
            }

            @Override
            public void onSkipToPrevious() {
                skip(-1);
            }
        });
        mediaSession.setFlags(
            MediaSession.FLAG_HANDLES_MEDIA_BUTTONS
                | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS
        );
        updateMediaSession(PlaybackState.STATE_STOPPED);
    }

    private void updateMediaSession(int state) {
        if (mediaSession == null) return;
        mediaSession.setMetadata(
            new MediaMetadata.Builder()
                .putString(MediaMetadata.METADATA_KEY_TITLE, title)
                .putString(MediaMetadata.METADATA_KEY_ARTIST, "Rebirth")
                .putString(MediaMetadata.METADATA_KEY_ALBUM, subtitle)
                .build()
        );
        mediaSession.setPlaybackState(
            new PlaybackState.Builder()
                .setActions(
                    PlaybackState.ACTION_PLAY
                        | PlaybackState.ACTION_PAUSE
                        | PlaybackState.ACTION_PLAY_PAUSE
                        | PlaybackState.ACTION_STOP
                        | PlaybackState.ACTION_SKIP_TO_NEXT
                        | PlaybackState.ACTION_SKIP_TO_PREVIOUS
                )
                .setState(
                    state,
                    PlaybackState.PLAYBACK_POSITION_UNKNOWN,
                    state == PlaybackState.STATE_PLAYING ? rate : 0f
                )
                .build()
        );
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Narration playback",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Background playback controls for Rebirth narration.");
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        Intent openApp = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentIntent = PendingIntent.getActivity(
            this,
            0,
            openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        boolean isPlaying = playbackRequested && !paused;
        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);
        builder
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(subtitle)
            .setContentIntent(contentIntent)
            .setOnlyAlertOnce(true)
            .setOngoing(playbackRequested)
            .addAction(
                isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isPlaying ? "Pause" : "Play",
                servicePendingIntent(isPlaying ? ACTION_PAUSE : ACTION_RESUME, 1)
            )
            .addAction(
                android.R.drawable.ic_media_previous,
                "Previous",
                servicePendingIntent(ACTION_SKIP_BACKWARD, 2)
            )
            .addAction(
                android.R.drawable.ic_media_next,
                "Next",
                servicePendingIntent(ACTION_SKIP_FORWARD, 3)
            )
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Stop",
                servicePendingIntent(ACTION_STOP, 4)
            );
        builder.setStyle(
            new Notification.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2)
        );
        return builder.build();
    }

    private PendingIntent servicePendingIntent(String action, int requestCode) {
        Intent intent = new Intent(this, BackgroundNarrationService.class).setAction(action);
        return PendingIntent.getService(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void updateNotification() {
        if (!foreground) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.notify(NOTIFICATION_ID, buildNotification());
    }

    private List<String> splitIntoChunks(String text) {
        List<String> result = new ArrayList<>();
        BreakIterator iterator = BreakIterator.getSentenceInstance(Locale.US);
        iterator.setText(text.trim());
        int start = iterator.first();
        int end;
        StringBuilder current = new StringBuilder();
        while ((end = iterator.next()) != BreakIterator.DONE) {
            String sentence = text.trim().substring(start, end).trim();
            start = end;
            if (sentence.isEmpty()) continue;
            if (sentence.length() > MAX_CHUNK_LENGTH) {
                flushChunk(current, result);
                appendLongSentence(sentence, result);
            } else if (current.length() + sentence.length() + 1 > MAX_CHUNK_LENGTH) {
                flushChunk(current, result);
                current.append(sentence);
            } else {
                if (current.length() > 0) current.append(' ');
                current.append(sentence);
            }
        }
        flushChunk(current, result);
        if (result.isEmpty()) result.add(text.trim());
        return result;
    }

    private void appendLongSentence(String sentence, List<String> result) {
        Pattern words = Pattern.compile("\\S+\\s*");
        Matcher matcher = words.matcher(sentence);
        StringBuilder current = new StringBuilder();
        while (matcher.find()) {
            String word = matcher.group();
            if (current.length() > 0 && current.length() + word.length() > MAX_CHUNK_LENGTH) {
                flushChunk(current, result);
            }
            current.append(word);
        }
        flushChunk(current, result);
    }

    private void flushChunk(StringBuilder current, List<String> result) {
        String value = current.toString().trim();
        if (!value.isEmpty()) result.add(value);
        current.setLength(0);
    }

    private void publishProgress() {
        publishProgress(false);
    }

    private void publishProgress(boolean finished) {
        if (chunks.isEmpty()) return;
        String sentence = finished
            ? chunks.get(chunks.size() - 1)
            : chunks.get(Math.min(chunkIndex, chunks.size() - 1));
        int percentage = finished
            ? 100
            : Math.min(
                99,
                Math.round(
                    ((chunkIndex + (sentence.isEmpty() ? 0f : (float) charIndex / sentence.length()))
                        / chunks.size())
                        * 100
                )
            );
        JSONObject data = new JSONObject();
        try {
            data.put("sessionId", sessionId);
            data.put("currentChunkIndex", chunkIndex);
            data.put("totalChunks", chunks.size());
            data.put("charIndex", charIndex);
            data.put("percentage", percentage);
            data.put("currentSentence", sentence);
        } catch (Exception ignored) {
            Log.e("RebirthNarration", "Failed to create progress event.");
            return;
        }
        publishEvent("progress", data);
    }

    private void publishState(String state, boolean isPaused, String error, boolean ended) {
        JSONObject data = new JSONObject();
        try {
            data.put("sessionId", sessionId);
            data.put("state", state);
            data.put("isPlaying", "playing".equals(state) || "paused".equals(state));
            data.put("isPaused", isPaused);
            data.put("ended", ended);
            if (error != null) data.put("error", error);
        } catch (Exception ignored) {
            Log.e("RebirthNarration", "Failed to create playback state event.");
            return;
        }
        publishEvent("state", data);
    }

    private void publishEvent(String eventName, JSONObject data) {
        Intent event = new Intent(ACTION_EVENT)
            .setPackage(getPackageName())
            .putExtra(EXTRA_EVENT_NAME, eventName)
            .putExtra(EXTRA_SESSION_ID, sessionId)
            .putExtra(EXTRA_EVENT_DATA, data.toString());
        sendBroadcast(event);
    }

    private boolean requestAudioFocus() {
        if (hasAudioFocus) return true;

        AudioAttributes attributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build();
        int result;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest == null) {
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attributes)
                    .setWillPauseWhenDucked(true)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(audioFocusChangeListener, handler)
                    .build();
            }
            result = audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            result = audioManager.requestAudioFocus(
                audioFocusChangeListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN
            );
        }

        if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            hasAudioFocus = true;
            resumeOnAudioFocusGain = false;
            return true;
        }
        if (result == AudioManager.AUDIOFOCUS_REQUEST_DELAYED) {
            resumeOnAudioFocusGain = playbackRequested && !paused;
            paused = true;
            updateMediaSession(PlaybackState.STATE_PAUSED);
            publishState("paused", true, null, false);
            updateNotification();
            return false;
        }

        fail("Android audio focus is unavailable. Pause other audio and try again.");
        return false;
    }

    private void onAudioFocusChanged(int focusChange) {
        if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            hasAudioFocus = true;
            if (resumeOnAudioFocusGain && playbackRequested) {
                resumeOnAudioFocusGain = false;
                paused = false;
                speakCurrentChunk();
            }
            return;
        }

        hasAudioFocus = false;
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT
            || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            if (playbackRequested && !paused) {
                resumeOnAudioFocusGain = true;
                pausePlaybackForAudioFocusLoss();
            }
            return;
        }

        if (focusChange == AudioManager.AUDIOFOCUS_LOSS) {
            hasAudioFocus = false;
            resumeOnAudioFocusGain = false;
            if (playbackRequested && !paused) pausePlaybackForAudioFocusLoss();
            abandonAudioFocus();
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            }
        } else {
            audioManager.abandonAudioFocus(audioFocusChangeListener);
        }
        hasAudioFocus = false;
    }

    private String safeNotificationText(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) return fallback;
        return value.length() > 120 ? value.substring(0, 120) : value;
    }

    private float clampRate(float value) {
        return Math.max(0.5f, Math.min(2.0f, value));
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        abandonAudioFocus();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
