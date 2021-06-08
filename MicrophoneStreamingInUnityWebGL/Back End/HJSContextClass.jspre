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
            let audioBuffer;
            let source;
            self.latency = 0.3;
            self.latencySecs = (self.latency / 1000);

            while (active) {
                audioBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                while (bufferQueue.length == 0) {
                    nextStartTime += self.latencySecs;
                    await self.forTime(self.latency - 0.08);
                }
                if (ctx.currentTime > nextStartTime) nextStartTime = ctx.currentTime + self.latency;
                let f32 = bufferQueue.shift();
                audioBuffer.getChannelData(0).set(f32);
                source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                if(nextStartTime == 0) nextStartTime = ctx.currentTime + waitTime;
                source.start(nextStartTime);
                nextStartTime += bufferTime;
                // console.log(bufferQueue.length);
                await self.until(_=> ctx.currentTime > nextStartTime - self.latency);
            }
        };

        mainLoop();        
    }

    Enqueue(buffer) {
        let num = this.bufferSize / buffer.length;
        // console.log("hsj: enqueueing " + buffer[0]);
        for (let i = 0; i < num; i++) {
            this.bufferQueue.push(buffer.subarray(i * buffer.length, (i + 1) * buffer.length));
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