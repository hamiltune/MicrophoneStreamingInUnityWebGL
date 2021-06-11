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
        var listener = ctx.listener;
        listener.setPosition(0,0,0);
        listener.setOrientation(0,0,1,0,1,0);
        
        // listener.positionX.value = 0;
        // listener.positionY.value = 0;
        // listener.positionZ.value = 0;

        // listener.forwardX.value = 0;
        // listener.forwardY.value = 0;
        // listener.forwardZ.value = 1;

        // ctx.listener.upX.value = 0;
        // ctx.listener.upY.value = 1;
        // ctx.listener.upZ.value = 0;

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
            // self.latency = 20;
            self.latencySecs = (self.latency / 1000);

            let panner = ctx.createPanner();
            panner.panningModel = 'equalpower';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;

            panner.connect(ctx.destination);
            self.panner = panner;
            self.listener = listener;

            self.pos = new Vector3(0,0,0);
            self.rot = new Vector3(0,0,0);

            setInterval(()=>{self.UpdatePosAndRot(self);}, 50);

            while (active) {
                if (bufferQueue.length == 0) {
                    while (active && bufferQueue.length == 0) {
                        await self.forTime(self.latency);
                    }
                    nextStartTime = ctx.currentTime + self.latencySecs;
                    console.log("blip");
                }
                while (active && bufferQueue.length > 0) {
                    let audioBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
                    let data = bufferQueue.shift();
                    audioBuffer.getChannelData(0).set(data.buffer);
                    let source = ctx.createBufferSource();
                    source.buffer = audioBuffer;

                    // listener.forwardX.value = -data.rot.x;
                    // listener.forwardY.value = data.rot.y;
                    // listener.forwardZ.value = -data.rot.z;
                    
                    if (bufferQueue.length == 0) {
                        self.pos = data.pos;
                        self.rot = data.rot;
                    }

                    
                    source.connect(panner);
                    
                    if(nextStartTime == 0) nextStartTime = ctx.currentTime + bufferTime;
                    source.start(nextStartTime);
                    nextStartTime += bufferTime;
                }
                await self.forTime(10);
            }
        };

        mainLoop();        
    }

    UpdatePosAndRot() {
        this.panner.setPosition(this.pos.x,this.pos.y,this.pos.z);
        this.listener.setOrientation(-this.rot.x,this.rot.y,-this.rot.z,0,1,0);
    }

    Enqueue(buffer, pos, rot) {
        let num = this.bufferSize / buffer.length;
        // console.log(pan);
        for (let i = 0; i < num; i++) {
            let wrapper = new DataWrapper(buffer.subarray(i * buffer.length, (i + 1) * buffer.length), pos, rot);
            if (this.bufferQueue == undefined) this.bufferQueue = [];
            this.bufferQueue.push(wrapper);
        }        
    }
}

var Vector3 = class {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

var WebGLListener = class {
    constructor(bufferSize, sampleRate, latency) {
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;
        this.latency = latency;
    }
}

var SourceWrapper = class {
    constructor(id, source, bufferSize) {
        this.id = id;
        this.source = source;
        this.bufferSize = bufferSize;
    }
}

var DataWrapper = class {
    constructor(buffer, pos, rot) {
        this.buffer = buffer;
        this.pos = pos;
        this.rot = rot;
    }
};