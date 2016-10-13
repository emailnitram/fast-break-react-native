import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  ListView
} from 'react-native';

import VideoPlayer from 'react-native-video-player';
import Highlight from './Highlight';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class Highlights extends Component {

  constructor() {
    super();

    this.state = {
      after: '',
      videoList: [],
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentDidMount() {
    this.callRedditApi();
  }

  callRedditApi(after = '') {
    fetch(`https://www.reddit.com/r/nba.json?after=${after}&raw_json=1`).then(resp => resp.json()).then(data => {
      let videos = data.data.children.filter(item => {
        let url = item.data.url;
        // return url.match(/streamable/) || url.match(/youtube.com\/watch/) || url.match(/youtu.be/)
        return url.match(/streamable/)
      })

      let vids = videos.map((v) => {
        console.log('v', v)
        return { shortCode: v.data.url.split('/')[3], title: v.data.title }
      })

      console.log('results', vids)
      this.setState({
        after: data.data.after,
        videoList: this.state.videoList.concat(vids),
        dataSource: ds.cloneWithRows(this.state.videoList.concat(vids))
      })
      if(this.state.videoList.length < 4) {
        this.callRedditApi(this.state.after);
      }
      // })
    })
  }

  render() {
    if(this.state.videoList.length === 0) {
      return (
        <ActivityIndicator
          style={[styles.centering, {transform: [{scale: 1.5}]}]}
          size="large"
        />
      )
    }
    return (
      <ListView
        style={styles.container}
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        renderRow={(rowData) => <Highlight shortCode={rowData.shortCode} title={rowData.title}></Highlight>}
      />
    );
  }
}

const styles = StyleSheet.create({
  centering: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 20,
  }
});