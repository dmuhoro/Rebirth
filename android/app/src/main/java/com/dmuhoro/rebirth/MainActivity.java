package com.dmuhoro.rebirth;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(BackgroundNarrationPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
