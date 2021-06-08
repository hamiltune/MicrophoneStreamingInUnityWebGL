mergeInto(LibraryManager.library, {

    InitializeWebGLListener: function (bufferSize, sampleRate, latency, id) {
        if (window.WebGLAudioSources == undefined) {
            window.WebGLAudioSources = [];
            window.sourceId = 0;
        }

        hctx = new HJSContext(bufferSize, sampleRate, latency);
        hctx.start();
        wrapper = new ListenerWrapper(id, hctx, bufferSize);
        window.WebGLAudioSources.push(wrapper);
        console.log("Added new audio source: " + id);
    },

    PushToAudioListener: function (buffer, pan, id) {
        if (window.WebGLAudioSources == undefined) return;
        src = undefined;
        window.WebGLAudioSources.forEach(function(listener) { if (listener.id == id) src = listener; });
        // console.log(id + " ("+src+"): " + unityBuffer[0]);
        if (src == undefined) return;
        unityBuffer = new Float32Array(HEAPF32.buffer, buffer, src.bufferSize);
        src.listener.Enqueue(unityBuffer);
    },

    MuteAudioListener: function(id) {

    }

});