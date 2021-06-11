mergeInto(LibraryManager.library, {

    InitializeWebGLListener: function (bufferSize, sampleRate, latency) {
        listener = new WebGLListener(bufferSize, sampleRate, latency);
        listener.WebGLAudioSources = [];
        window.WebGLListener = listener;
        listener.CreateWebGLSource = function (id) {
            hctx = new HJSContext(window.WebGLListener.bufferSize, window.WebGLListener.sampleRate, window.WebGLListener.latency);
            hctx.start();
            wrapper = new SourceWrapper(id, hctx, window.WebGLListener.bufferSize);
            window.WebGLListener.WebGLAudioSources.push(wrapper);
            console.log("Added new audio source: " + id);
            return wrapper;
        };
    }, 

    PushToAudioListener: function (buffer, px, py, pz, rx, ry, rz, id) {
        src = undefined;
        window.WebGLListener.WebGLAudioSources.forEach(function(source) { if (source.id == id) src = source; });
        if (src == undefined) src = window.WebGLListener.CreateWebGLSource(id);
        unityBuffer = new Float32Array(HEAPF32.buffer, buffer, src.bufferSize);
        src.source.Enqueue(unityBuffer, new Vector3(px, py, pz), new Vector3(rx, ry, rz));
    },

    MuteAudioListener: function(id) {

    }

});