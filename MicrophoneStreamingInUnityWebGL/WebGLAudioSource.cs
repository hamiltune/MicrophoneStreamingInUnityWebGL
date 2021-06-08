using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebGLAudio;

public class WebGLAudioSource : MonoBehaviour
{
    [Header("Settings")]
    public int sampleRate = 44100;
    public int bufferSize = 256;
    public int latencyInMS = 300;
    public float spatialBlend = 1.0f;
    [Header("Debug")]
    public bool isMuted = false;
    public int sourceId = 0;
    protected Queue<float[]> buffers;
    private float[] currentBuffer;
    protected int position;
    public AudioSource source;



    // Private
    private bool muted = false;
    // Start is called before the first frame update
    void Start()
    {
        sourceId = gameObject.GetInstanceID();
        #if UNITY_WEBGL && !UNITY_EDITOR

        #else
            buffers = new Queue<float[]>();
            position = bufferSize;
            source = gameObject.AddComponent<AudioSource>();
            source.playOnAwake = false;
        #endif
    }

    protected virtual void ReadCallback (float[] data) {
        for (int i = 0; i < data.Length; i++) {

            if (position == bufferSize) {
                if (buffers.Count > 0) currentBuffer = buffers.Dequeue();
                position = 0;
            }

            if (buffers.Count == 0) data[i] = 0;
            else {
                data[i] = currentBuffer[position];
            }

            position++;
        }
    }

    public void SetStreamInfo(int rate, int size, int latencyMS) {
        sampleRate = rate;
        bufferSize = size;
        latencyInMS = latencyMS;

        #if UNITY_WEBGL && !UNITY_EDITOR

        #else
            source.clip = AudioClip.Create("Stream", bufferSize, 1, sampleRate, true, ReadCallback);
            source.loop = true;
            source.spatialBlend = spatialBlend;
        #endif
    }

    public void SetSource(AudioSource psource, bool waitUntilFinished) {
        if (source.isPlaying) {
            if (waitUntilFinished) {
                StartCoroutine(delayedStop(psource));
                return;
            }
            else source.Stop();
        }
        
        source = psource;
    }

    private IEnumerator delayedPlay() {
        yield return new WaitForSeconds(latencyInMS / 1000f);
        source.Play();
    }

    private IEnumerator delayedStop(AudioSource psource) {
        while (source.isPlaying) yield return null;
        source.Stop();
        source = psource;
    }

    public void SetClipInfo(int rate, int size, int latencyMS, AudioClip clip) {
        sampleRate = rate;
        bufferSize = size;
        latencyInMS = latencyMS;
        source.clip = clip;
    }

    public void StartAudioSource() {
        #if !UNITY_WEBGL 
            StartCoroutine(delayedPlay());
        #endif
    }

    public void Push(float[] data) {
        int num = data.Length / bufferSize;
        for (int i = 0; i < num; i++) {
            #if UNITY_WEBGL && !UNITY_EDITOR
                PushWebGL(data);
            #else
                PushNonWebGL(data);
            #endif
        }
    }

    protected virtual void PushNonWebGL(float[] data) {
        buffers.Enqueue(data);
    }

    protected virtual void PushWebGL(float[] data) {
        Debug.Log(WebGLAudio.WebGLAudio.listeners.Count);
        foreach (WebGLAudioListener listener in WebGLAudio.WebGLAudio.listeners) {
            listener.PushToDestination(data, transform.position, spatialBlend);
        }
    }

    public void Mute() {
        #if UNITY_WEBGL && !UNITY_EDITOR
            //muted = MuteAudioListener();
        #else
            muted = !muted;
        #endif
        isMuted = muted;
    }

    public void Remove() {
        #if UNITY_WEBGL && !UNITY_EDITOR

        #endif
    }
}
