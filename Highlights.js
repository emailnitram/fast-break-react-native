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
  TextInput,
  Platform
} from 'react-native';

import VideoPlayer from 'react-native-video-player';
import Highlight from './Highlight';
import debounce from 'debounce';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class Highlights extends Component {

  constructor() {
    super();

    this.after = '';
    this.refreshing = false;
    this.fetchInProgress = false;
    this.videoList = [];
    this.searchMode = false;
    this.searchQuery = '';
    this.searchCall = debounce(() => {
      if(!this.fetchInProgress){
        this.setState({dataSource: ds.cloneWithRows([])})
      }
      this.callRedditApi('', this.searchQuery);
    }, 1000);

    this.state = {
      dataSource: ds.cloneWithRows([]),
      error: false,
      firstLoadComplete: false
    };
  }

  componentDidMount() {
    this.callRedditApi();
  }

  _onRefresh() {
    this.setState({firstLoadComplete: false});
    this.refreshing = true;
    this.searchMode = false;
    this.callRedditApi('');
  }

  _retryLoad() {
    this.fetchInProgress = false;
    this.callRedditApi('');
  }

  _loadMore() {
    if(this.after === null) {
      return;
    }
    this.callRedditApi(this.after, this.searchQuery);
  }

  callRedditApi(after = '', query = '') {
    if (this.fetchInProgress) {
      return;
    }

    let url;
    if(this.searchMode) {
      url = `https://www.reddit.com/r/nba/search.json?q=${query}+site%3Astreamable.com&restrict_sr=on&sort=new&t=all&after=${after}&raw_json=1`
    } else {
      url = `https://www.reddit.com/r/nba.json?after=${after}&raw_json=1`
    }

    this.fetchInProgress = true;
    fetch(url).then(resp => resp.json()).then(data => {
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

      let vidList = after === '' ? [] : this.videoList;
      let videoList = vidList.concat(vids);

      this.after = data.data.after
      this.refreshing = false;
      this.fetchInProgress = false;
      this.videoList = videoList;

      this.setState({
        dataSource: ds.cloneWithRows(videoList),
        error: false,
        firstLoadComplete: true
      })
      if(after === null && query !== ''){
        return;
      }
      if (videoList.length < 1) {
        this.callRedditApi(data.data.after, query);
      }
    })
    .catch(error => this.setState({error: true}));
  }

  filterResults(q) {
    this.searchMode = q === '' ? false : true;
    this.searchQuery = q;
    this.searchCall();
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
    if(!this.state.firstLoadComplete) {
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
            refreshing={this.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
        renderHeader={() => {
            return (
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={(text) => this.filterResults(text)}
                placeholder="Search"
              />
            )
          }
        }
        renderFooter={() => {
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
