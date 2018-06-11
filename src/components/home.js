import Remon from '@remotemonster/sdk'
var remon
const key = '1234567890'
const serviceId = 'SERVICEID1'
// ref doc: https://vuetifyjs.com/en/examples/layouts/googleContacts
// ref doc: https://vuetifyjs.com/ko/components/selection-controls

export default {
  name: 'Home',
  mounted () {
    this.createDummyRemonForSearchLoop()
    this.startSearchLoop()
    this.getDevices()
  },
  data () {
    return {
      string_go: 'Create a room',
      drawer: null,
      roomid: null,
      roomList: [],
      localVideoVisibility: 'hidden',
      localVideoDisplay: 'none',
      localVideoWidth: '20%',
      localVideoHeight: '20%',
      remoteVideoVisibility: 'hidden',
      remoteVideoDisplay: 'none',
      createFormVisibility: 'visible',
      createFormDisplay: 'inline',
      closeButtonVisibility: 'hidden',
      channelId: null,
      useVideo: true,
      useCast: false,
      isViewer: true,
      hasNewChannels: false,
      selectedResolution: 'vga',
      resolutionItems: [
        {text:'VGA(640-480)', id: 'vga'},
        {text:'QVGA(320-240)', id: 'qvga'}
      ],
      resolutionList: {
        'vga': {width:640, height:480},
        'qvga': {width:320, height:240}
      },
      selectedCodec: 'VP8',
      codecItems: [
        {text:'VP8', id: 'VP8'},
        {text:'VP9', id: 'VP9'},
        {text:'H.264', id: 'H264'}
      ],
      cameraList: [],
      selectedCamera: null,
      micList: [],
      selectedMic: null,
      speakerList: [],
      selectedSpeaker: null,
      framerate: 20,
      maxBandwidth: 1000,
      cameraList: [],
      micList: [],
      speakerList: [],
      serverUrl: 'signal.remotemonster.com',
      serviceId: 'SERVICEID1',
      key: '1234567890',
      logbox: null,
      logLevel: 'INFO',
      logLevels: [
        {text:'error', id: 'ERROR'},
        {text:'warn', id: 'WARN'},
        {text:'info', id: 'INFO'},
        {text:'debug', id: 'DEBUG'},
        {text:'verbose', id: 'VERBOSE'}
      ],
      currentStat: null,
    }
  },
  methods: {
    createDummyRemonForSearchLoop () {
      if (remon) remon.close()
      let cfg = {
        credential: { key: key, serviceId: serviceId },
        view: { local: '#localVideo1', remote: '#remoteVideo1' },
        media: { audio: true, video: true },
      }
      cfg.credential.wsurl = 'wss://'+ this.serverUrl + '/ws'
      cfg.credential.resturl = 'https://'+ this.serverUrl + '/rest'
      remon = new Remon({config: cfg})
    },
    makeConfig () {
      const wsurl = 'wss://'+ this.serverUrl + '/ws'
      const resturl = 'https://'+ this.serverUrl + '/rest'
      let cfg = {
        credential: { key: this.key, serviceId: this.serviceId, wsurl: wsurl, resturl: resturl },
        view: { local: '#localVideo1', remote: '#remoteVideo1' },
        media: {
          audio: true,
          video: {
            width: { max: this.resolutionList[this.selectedResolution].width, min: 320, ideal: this.resolutionList[this.selectedResolution].width },
            height: { max: this.resolutionList[this.selectedResolution].height, min: 240, ideal: this.resolutionList[this.selectedResolution].height },
            codec: this.selectedCodec, maxBandwidth: this.maxBandwidth, 
            frameRate: {min: this.framerate, max: this.framerate}
          }
        },
        dev: { logLevel: this.logLevel }
      }
      if (!this.useVideo) cfg.media.video= false
      if (this.selectedCamera !== null) cfg.media.video.deviceId = { exact: [this.selectedCamera] }
      if (this.selectedMic !== null) cfg.media.audio.deviceId = { exact: [this.selectedMic] }
      return cfg
    },
    startSearchLoop () {
      var self = this
      setInterval(async function() {
        var searchResult = await remon.fetchCalls()
        self.roomList = []
        searchResult.forEach( (ch, i) =>{
          ch.type='P2P'
          if (ch.status === 'WAIT') self.roomList.push(ch)
        })
        searchResult = await remon.fetchCasts()
        searchResult.forEach( (ch, i) => {
          ch.type='BROADCAST'
          self.roomList.push(ch)
        })
        if (self.roomList.length>0) self.hasNewChannels = true
        else self.hasNewChannels = false
      },2000)
    },
    getObserver () {
      const self = this
      const observer= {
        onComplete() {
          if (self.useCast)return
          if (self.useVideo)self.showLocalVideoNormal()
          self.hideCreateForm()
        },
        onConnect(chid) { // for create call channel is successful
          self.hideCreateForm()
          if (!self.useCast && self.useVideo) self.showLocalVideoFull()
        },
        onJoin() {
          self.hideCreateForm()
          self.localVideoVisibility = 'hidden'
          self.localVideoDisplay = 'none'
        },
        onCreate(chid) {
          self.roomid = chid
          self.hideCreateForm()
          self.showLocalVideoFull()
        },
        onClose() {
          self.close()
        },
        onLog(msg) {
          self.logbox = self.logbox+'\n'+msg
        },
        onStat(stat) {
          self.currentStat = stat
        }
      }
      return observer
    },
    connectChannel (chid) {
      remon = new Remon({config:this.makeConfig(), listener: this.getObserver()})
      remon.connectChannel(chid)
    },
    createChannel () {
      remon = new Remon({config:this.makeConfig(), listener: this.getObserver()})
      if (!this.channelId) this.channelId = 'test room'
      remon.connectChannel(this.channelId)
    },
    joinCast (chid) {
      this.useCast = true
      this.isViewer = true
      var cfg = this.makeConfig()
      delete cfg.view.local
      remon = new Remon({config:this.makeConfig(), listener: this.getObserver()})
      remon.joinCast(chid)
    },
    createCast () {
      this.useCast = true
      this.isViewer = false
      remon = new Remon({config:this.makeConfig(), listener: this.getObserver()})
      remon.createCast(this.channelId)
    },
    close () {
      remon.close()
      this.showCreateForm()
    },
    getDevices () {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
            for (var i = 0; i < devices.length; i++) {
              var device = devices[i];
              if (device.kind === 'videoinput') {
                this.cameraList.push({text: device.label, id: device.deviceId})
              } else if (device.kind === 'audioinput') {
                this.micList.push({text: device.label, id: device.deviceId})
              } else if (device.kind === 'audiooutput') {
                this.speakerList.push({text: device.label, id: device.deviceId})
              }
            };
        })
    },
    hideCreateForm () {
      if (this.isViewer && this.useCast){
        this.localVideoVisibility = 'hidden'
        this.localVideoDisplay = 'none'
      }else {
        this.localVideoVisibility = 'visible'
        this.localVideoDisplay = 'inline'
      }
      if (this.isViewer){
        this.remoteVideoVisibility = 'visible'
        this.remoteVideoDisplay = 'inline'
      }
      this.createFormVisibility = 'hidden'
      this.createFormDisplay = 'none'
      this.closeButtonVisibility = 'visible'
    },
    showCreateForm () {
      this.localVideoVisibility = 'hidden'
      this.localVideoDisplay = 'none'
      this.remoteVideoVisibility = 'hidden'
      this.remoteVideoDisplay = 'none'
      this.createFormVisibility = 'visible'
      this.createFormDisplay = 'inline'
      this.closeButtonVisibility = 'hidden'
    },
    showLocalVideoFull () {
      this.localVideoVisibility = 'visible'
      this.localVideoDisplay = 'inline'
      this.localVideoWidth = '100%'
      this.localVideoHeight = '100%'
    },
    showLocalVideoNormal () {
      this.localVideoVisibility = 'visible'
      this.localVideoDisplay = 'inline'
      this.localVideoWidth = '20%'
      this.localVideoHeight = '20%'
    },
    copy () {
      var copyText = document.getElementById('logBox')
      copyText.select()
      document.execCommand('copy')
    }
  }
}