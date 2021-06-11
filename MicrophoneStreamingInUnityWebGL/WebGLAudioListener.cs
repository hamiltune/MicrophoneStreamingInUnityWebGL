using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebGLAudio;
using System.Runtime.InteropServices;

public class WebGLAudioListener : MonoBehaviour
{
    [Header("Settings")]
    public int sampleRate = 44100;
    public int bufferSize = 256;
    public int latencyInMS = 300;
    public float volume = 1.0f;

    [Header("Debug")]
    public int listenerId = 0;  
    public bool isMuted = false;
    #pragma warning disable 0414
    private bool muted = false;
    #pragma warning restore 0414

    #if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern int InitializeWebGLListener(int size, int rate, int latency);
        [DllImport("__Internal")]
        private static extern bool PushToAudioListener(float[] buffer, float px, float py, float pz, float rx, float ry, float rz, int id);
        [DllImport("__Internal")]
        private static extern bool MuteAudioListener(int id);
    #endif
    void Start()
    {
        listenerId = gameObject.GetInstanceID();

        WebGLAudio.WebGLAudio.listeners.Add(this);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
            InitializeWebGLListener(bufferSize, sampleRate, latencyInMS);
        #else
            muted = true;
        #endif
    }

    public void PushToDestination(float[] data, Vector3 src, int srcId, float spatialBlend) {
        #if UNITY_WEBGL && !UNITY_EDITOR

            if (muted) return;

            Vector3 relPos = src - transform.position;
            Vector3 rot = transform.forward;

            // float pan = 0.0f;

            // float dist, vol, tmp, angle, otherBlend;

            // otherBlend = 1f - spatialBlend;
            // spatialBlend *= volume;
            // otherBlend *= volume;

            // angle = Vector3.Angle(transform.forward, src - transform.position);
            // pan = Mathf.Sin(angle);           
            
            // dist = (src - transform.position).magnitude;
            // vol = 1f / dist;

            // for (int i = 0; i < bufferSize; i++) {
            //     tmp = data[i];
            //     data[i] = spatialBlend * tmp * vol + otherBlend * tmp;
            // }

            PushToAudioListener(data, relPos.x, relPos.y, relPos.z, rot.x, rot.y, rot.z, srcId);

        #endif
    }

    public void Mute() {
        #if UNITY_WEBGL && !UNITY_EDITOR
            muted = MuteAudioListener(listenerId);
            isMuted = muted;
        #endif
    }
}
