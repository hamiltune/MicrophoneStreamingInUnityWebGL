mergeInto(LibraryManager.library, {

    InitializeMicrophone: function (playerName, pointer1, pointer2, bufferSize, sampleRate) {

        window.MicIsActive = false;
        window.MicIsMuted = false;
        var buffers = [];
        var currentBuffer = 0;
        var name = Pointer_stringify(playerName);

        const handleSuccess = function(stream) {
            buffers[0] = new Float32Array(HEAPF32.buffer, pointer1, bufferSize);
            buffers[1] = new Float32Array(HEAPF32.buffer, pointer2, bufferSize);
            hms = new HJSMicStream(bufferSize, sampleRate, function(e) {
                if (!window.MicIsMuted) {
                    buffers[currentBuffer].set(e);
                    currentBuffer = 1 - currentBuffer;
                    //console.log(e);
                    unityInstance.SendMessage(name, "UpdateBuffer");
                }
            }); 
            hms.start();

            window.MicIsActive = true;

        };

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(handleSuccess);
    },

    MuteMicrophone: function () {
        window.MicIsMuted = !window.MicIsMuted;
        console.log("Mic muted: " + window.MicIsMuted);
        return window.MicIsMuted;
    }

});