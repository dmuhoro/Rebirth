package com.dmuhoro.rebirth;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONException;

@CapacitorPlugin(
    name = "BackgroundNarration",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { Manifest.permission.POST_NOTIFICATIONS }
        )
    }
)
public class BackgroundNarrationPlugin extends Plugin {
    private final BroadcastReceiver eventReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String eventName = intent.getStringExtra(BackgroundNarrationService.EXTRA_EVENT_NAME);
            String eventData = intent.getStringExtra(BackgroundNarrationService.EXTRA_EVENT_DATA);
            if (eventName == null || eventData == null) return;
            try {
                notifyListeners(eventName, new JSObject(eventData));
            } catch (JSONException error) {
                notifyListeners("error", new JSObject().put("message", "Invalid audio event."));
            }
        }
    };

    @Override
    public void load() {
        super.load();
        IntentFilter filter = new IntentFilter(BackgroundNarrationService.ACTION_EVENT);
        ContextCompat.registerReceiver(
            getContext(),
            eventReceiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        );
    }

    @Override
    protected void handleOnDestroy() {
        getContext().unregisterReceiver(eventReceiver);
        super.handleOnDestroy();
    }

    @PluginMethod
    public void play(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "playAfterNotificationPermission");
            return;
        }
        startPlayback(call);
    }

    @PermissionCallback
    private void playAfterNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            && getPermissionState("notifications") != PermissionState.GRANTED) {
            call.reject("Allow notifications to use lock-screen narration controls.");
            return;
        }
        startPlayback(call);
    }

    private void startPlayback(PluginCall call) {
        String text = call.getString("text");
        String title = call.getString("title", "Rebirth narration");
        String subtitle = call.getString("subtitle", "Rebirth");
        double rate = call.getDouble("rate", 1.0);

        if (text == null || text.trim().isEmpty()) {
            call.reject("Narration text cannot be empty.");
            return;
        }
        if (text.length() > 200_000) {
            call.reject("Narration text is too long for one playback session.");
            return;
        }
        if (!Double.isFinite(rate) || rate < 0.5 || rate > 2.0) {
            call.reject("Narration speed must be between 0.5x and 2x.");
            return;
        }

        Intent intent = new Intent(getContext(), BackgroundNarrationService.class)
            .setAction(BackgroundNarrationService.ACTION_PLAY)
            .putExtra(BackgroundNarrationService.EXTRA_TEXT, text)
            .putExtra(BackgroundNarrationService.EXTRA_TITLE, title)
            .putExtra(BackgroundNarrationService.EXTRA_SUBTITLE, subtitle)
            .putExtra(BackgroundNarrationService.EXTRA_RATE, (float) rate)
            .putExtra(
                BackgroundNarrationService.EXTRA_SESSION_ID,
                call.getInt("sessionId", 0)
            );

        try {
            ContextCompat.startForegroundService(getContext(), intent);
            call.resolve();
        } catch (RuntimeException error) {
            call.reject("Android could not start background narration.", error);
        }
    }

    @PluginMethod
    public void pause(PluginCall call) {
        sendAction(BackgroundNarrationService.ACTION_PAUSE, call);
    }

    @PluginMethod
    public void resume(PluginCall call) {
        sendAction(BackgroundNarrationService.ACTION_RESUME, call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        sendAction(BackgroundNarrationService.ACTION_STOP, call);
    }

    @PluginMethod
    public void skipForward(PluginCall call) {
        sendAction(BackgroundNarrationService.ACTION_SKIP_FORWARD, call);
    }

    @PluginMethod
    public void skipBackward(PluginCall call) {
        sendAction(BackgroundNarrationService.ACTION_SKIP_BACKWARD, call);
    }

    @PluginMethod
    public void setRate(PluginCall call) {
        Double rate = call.getDouble("rate");
        if (rate == null || !Double.isFinite(rate) || rate < 0.5 || rate > 2.0) {
            call.reject("Narration speed must be between 0.5x and 2x.");
            return;
        }
        Intent intent = new Intent(getContext(), BackgroundNarrationService.class)
            .setAction(BackgroundNarrationService.ACTION_SET_RATE)
            .putExtra(BackgroundNarrationService.EXTRA_RATE, rate.floatValue());
        sendServiceIntent(intent, call);
    }

    private void sendAction(String action, PluginCall call) {
        sendServiceIntent(
            new Intent(getContext(), BackgroundNarrationService.class).setAction(action),
            call
        );
    }

    private void sendServiceIntent(Intent intent, PluginCall call) {
        try {
            getContext().startService(intent);
            call.resolve();
        } catch (RuntimeException error) {
            call.reject("Android could not control background narration.", error);
        }
    }
}
