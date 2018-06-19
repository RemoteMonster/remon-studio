<template>
  <v-app>
    <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model='drawer' fixed app>
      <v-expansion-panel>
        <v-expansion-panel-content>
          <div slot="header">Basic setup</div>
          <v-card>
            <v-switch label='use video' v-model='useVideo'></v-switch>
            <v-select :items="resolutionItems" item-text='text' item-value='id' v-model="selectedResolution" label="Resolution" ></v-select>
            <v-select :items="codecItems" item-text='text' item-value='id' v-model="selectedCodec" label="Video codec" ></v-select>
            <v-text-field v-model='framerate' label='Framerate'></v-text-field>
            <v-text-field v-model='maxBandwidth' label='Max bandwidth'></v-text-field>
            <v-select :items="logLevels" item-text='text' item-value='id' v-model="logLevel" label="Log level"></v-select>
            <v-text-field v-model='serverUrl' label='Server URL' @focusout='createDummyRemonForSearchLoop()'></v-text-field>
            <v-text-field v-model='serviceId' label='Service Id' @focusout="createDummyRemonForSearchLoop()"></v-text-field>
            <v-text-field v-model='key' label='Service key' @focusout='createDummyRemonForSearchLoop()'></v-text-field>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">
            <v-badge color="red" v-model='hasNewChannels'>
              <span slot="badge">!</span>
              Channel List
            </v-badge>
          </div>
          <v-card>
            <v-btn round color='primary' dark v-for='(ch) in roomList'
              v-on:click="ch.type==='P2P'?connectChannel(ch.id):joinCast(ch.id)" v-bind:key=ch.id>
              {{ ch.id.length >9? ch.id.substring(0, 9-3) + '...': ch.id }}
            </v-btn>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Input sources</div>
          <v-card>
            <v-select :items="cameraList" item-text='text' item-value='id' v-model="selectedCamera" label="Camera" ></v-select>
            <v-select :items="micList" item-text='text' item-value='id' v-model="selectedMic" label="Microphone" ></v-select>
            <v-select :items="speakerList" item-text='text' item-value='id' v-model="selectedSpeaker" label="Speaker" ></v-select>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Mixing</div>
          <v-card>
            <v-card-text>TBD</v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Log</div>
          <v-card>
            <v-text-field id='logBox' name="logbox" label="log" v-model='logbox' textarea rows=10></v-text-field>
            <v-btn round color='primary' dark v-on:click='copy'>copy</v-btn>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Monitoring</div>
          <v-card>
            <v-card-text>{{ currentStat }}</v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color='blue darken-3' dark app fixed>
      <v-toolbar-title style='width: 300px' class='ml-0 pl-3'>
        <v-toolbar-side-icon @click.stop="drawer = !drawer">
        </v-toolbar-side-icon>
        <span class='hidden-sm-and-down'>Remon Studio <img style='width:19px; height:25px;' src='../assets/favicon.png'></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon onclick='location.reload()'>
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>help</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <video id='remoteVideo1' style='z-index:9; position:absolute; width:80%; height:80%; overflow:auto;' autoplay controls v-bind:style='{ visibility: remoteVideoVisibility, display:remoteVideoDisplay }'></video>
        <audio id='remoteAudio1' autoplay controls style='visibility:hidden;display:none;'></audio>
        <video id='localVideo1' style='z-index:10; margin-left:auto;margin-bottom:auto;' autoplay controls muted v-bind:style='{ width:localVideoWidth, height:localVideoHeight, visibility: localVideoVisibility, display:localVideoDisplay}'></video>
        <audio id='localAudio1' autoplay controls style='visibility:hidden;display:none;'></audio>
        <v-flex xs8 v-bind:style='{ visibility: createFormVisibility, display: createFormDisplay}' style="margin-left:auto; margin-right:auto;">
          <img src='../assets/background.png' style='width:80%;height:80%;'>
          <v-text-field v-on:keyup.enter='createChannel' label='enter new channel name' value='Input text' v-model='channelId'></v-text-field>
          <span>
            <v-btn color='info' v-on:click="useCast===true?createCast():createChannel()">
              {{string_go}}
            </v-btn>
            <v-switch :label="useCast?'Broadcast mode':'P2P call mode'" v-model='useCast'></v-switch>
          </span>
        </v-flex>
      </v-container>
      <div style='position:absolute; bottom:50px; left:50%;width:200px;height:100px;'>
        <v-btn v-on:click='close()' color='pink' fab v-bind:style='{ visibility: closeButtonVisibility }' style='z-index:11;'>
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </v-content>
  </v-app>
</template>

<script src='./home.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
