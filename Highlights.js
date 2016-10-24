import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableHighlight,
  ActivityIndicator,
  ListView,
  RefreshControl,
  Platform
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
      error: false,
      refreshing: false,
      fetchInProgress: false
    };
  }

  componentDidMount() {
    this.callRedditApi();
  }

  _onRefresh() {
    this.callRedditApi('');
  }

  _retryLoad() {
    this.setState({fetchInProgress: false});
    this.callRedditApi('');
  }

  _loadMore() {
    this.callRedditApi(this.state.after);
  }

  callRedditApi(after = '') {
    if (this.state.fetchInProgress) {
      return;
    }

    this.setState({fetchInProgress:true});
    fetch(`https://www.reddit.com/r/nba.json?after=${after}&raw_json=1`).then(resp => resp.json()).then(data => {
      let videos = data.data.children.filter(item => {
        let url = item.data.url;
        return url.match(/streamable/)
      })

      let vids = videos.map((v) => {
        return { shortCode: v.data.url.split('/')[3], title: v.data.title, created_utc: v.data.created_utc }
      })

      vids = vids.filter((v) => {
        return v.shortCode.length === 4;
      })

      let vidList = after === '' ? [] : this.state.videoList;
      let videoList = vidList.concat(vids);

      this.setState({
        after: data.data.after,
        videoList: videoList,
        dataSource: ds.cloneWithRows(videoList),
        refreshing: false,
        error: false,
        fetchInProgress: false
      })
      if (videoList.length < 1) {
        this.callRedditApi(data.data.after);
      }
    })
    .catch(error => this.setState({error: true}));
  }

  render() {
    if(this.state.error) {
      return (
        <View style={styles.centering}>
          <TouchableHighlight onPress={() => this._retryLoad()} underlayColor={'transparent'}>
            <Image source={require('./warning.png')} style={{width: 150, height: 150}} />
          </TouchableHighlight>
          <Text style={styles.errorText}>An error has occured</Text>
          <Text style={styles.errorText}>Check internet connection</Text>
          <Text style={styles.errorText}>Press triangle to try again</Text>
          <Text style={[styles.errorText, styles.emojiText]}>😥</Text>
        </View>
      )
    }
    if(this.state.videoList.length === 0) {
      return (
        <View style={[styles.centering, {transform: [{scale: 1.5}]}]}>
          <ActivityIndicator />
          <Text style={styles.loading}>LOADING</Text>
        </View>
      )
    }
    return (
      <ListView
        style={styles.container}
        enableEmptySections={true}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
        renderFooter={() => {
            if(!this.state.fetchInProgress) {
              return null;
            }
            return (
              <View style={[styles.centering, {height: 100}]}>
                <ActivityIndicator />
              </View>
            ) 
          }
        }
        onEndReached={this._loadMore.bind(this)}
        dataSource={this.state.dataSource}
        renderRow={(rowData) => <Highlight shortCode={rowData.shortCode} title={rowData.title} created_utc={rowData.created_utc}></Highlight>}
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
  loading: {
    fontSize: 8
  },
  errorText: {
    fontSize: 14
  },
  emojiText: {
    paddingBottom: 5
  },
  container: {
    flex: 1,
    marginTop: (Platform.OS === 'ios') ? 20 : 0,
  }
});
