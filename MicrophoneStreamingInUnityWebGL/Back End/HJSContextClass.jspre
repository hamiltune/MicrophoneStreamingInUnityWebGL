var HJSContext = class {

    constructor(bufferSize, sampleRate, latency) {
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;
        this.latency = latency;
    }

    until(conditionFunction) {

        const poll = resolve => {
            if (conditionFunction()) resolve();
            else setTimeout(_ => poll(resolve), 23);
        }

        return new Promise(poll);
    }

    forTime(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async start () {
        var active = false;
        var bufferSize = this.bufferSize;
        var sampleRate = this.sampleRate;

        let self = this;

        var ctx = new AudioContext({sampleRate: sampleRate});
        this.ctx = ctx;
        var nextStartTime = ctx.currentTime + 0.1;
        var bufferTime = bufferSize / sampleRate;
        var waitTime = bufferTime / 2;

        this.bufferQueue = [];
        var bufferQueue = this.bufferQueue;

        active = true;

                // Main loop
        const mainLoop = async function () {
            console.log("Started Main HJS Loop");
            // TODO: Adjust the initial wait and buffer size. Lose dynamics though..
            nextStartTime = ctx.currentTime + 0.1;
            // let audioBuffer;
            // let source;
            // let panner;
            // let data;
            // self.latency = 40;
            self.latencySecs = (self.latency / 1000);

            while (active) {
                if (bufferQueue.length == 0) {
                    while (active && bufferQueue.length == 0) {
                        await self.forTime(self.latency);
                    }
                    nextStartTime = ctx.currentTime + self.latencySecs;
                }
                while (active && bufferQueue.length > 0) {
                    let audioBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                    let data = bufferQueue.shift();
                    audioBuffer.getChannelData(0).set(data.buffer);
                    let source = ctx.createBufferSource();
                    let panner = ctx.createStereoPanner();
                    source.buffer = audioBuffer;
                    panner.pan.value = data.pan;
                    source.connect(panner);
                    panner.connect(ctx.destination);
                    if(nextStartTime == 0) nextStartTime = ctx.currentTime + bufferTime;
                    source.start(nextStartTime);
                    nextStartTime += bufferTime;
                }
                await self.forTime(10);
            }
        };

        mainLoop();        
    }

    Enqueue(buffer) {
        let num = this.bufferSize / buffer.length;
        let pan = 0.5;
        // console.log("hsj: enqueueing " + buffer[0]);
        for (let i = 0; i < num; i++) {
            let wrapper = new DataWrapper(buffer.subarray(i * buffer.length, (i + 1) * buffer.length), pan);
            this.bufferQueue.push(wrapper);
        }        
    }
}

var ListenerWrapper = class {
    constructor(id, listener, bufferSize) {
        this.id = id;
        this.listener = listener;
        this.bufferSize = bufferSize;
    }
}

var DataWrapper = class {
    constructor(buffer, pan) {
        this.buffer = buffer;
        this.pan = pan;
    }
};