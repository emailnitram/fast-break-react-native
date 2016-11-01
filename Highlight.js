import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  TouchableHighlight,
  Platform
} from 'react-native';

import VideoPlayer from 'react-native-video-player';
import timeAgo from 'time-ago';
import AndroidShare from 'react-native-android-share';

let ta = timeAgo();

export default class Highlight extends Component {

  constructor() {
    super();

    this.state = {
      video: { width: undefined, height: undefined, duration: undefined },
      thumbnailUrl: undefined,
      videoUrl: undefined,
      error: false
    };
  }

  componentDidMount() {
    global.fetch(`https://api.streamable.com/videos/${this.props.shortCode}`)
      .then(res => res.json())
      .then(res => {
        let vidKey;
        if(res.files.hasOwnProperty('mp4-mobile')) {
          vidKey = 'mp4-mobile'
        } else {
          vidKey = 'mp4'
        }
        this.setState({
          thumbnailUrl: `https:${res.thumbnail_url}`,
          videoUrl: `https:${res.files[vidKey].url}`,
          video: { 
            width: res.files[vidKey].width,
            height: res.files[vidKey].height,
            duration: res.files[vidKey].duration
          }
        })
      })
      .catch(error => this.setState({error: true}) );
  }

  showShareActionSheet(shortCode) {
    if(Platform.OS === 'ios') {
      ActionSheetIOS.showShareActionSheetWithOptions({
        url: `https://streamable.com/${shortCode}`,
        message: this.props.title
      },
      (error) => alert(error),
      (success, method) => {});
    } else {
      let object = {subject: this.props.title, text: `https://streamable.com/${shortCode}`};
      AndroidShare.openChooserWithOptions(object, 'Share Highlight');
    }
  };

  render() {

    if(this.state.videoUrl === undefined) {
      return (
        <View style={styles.centering}>
          <ActivityIndicator />
        </View>
      )
    }

    if(this.state.error) {
      return null;
    }
    return (
      <View style={styles.view}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{ta.ago(new Date(this.props.created_utc * 1000))}</Text>
        </View>
        <View style={styles.video}>
          <VideoPlayer
            thumbnail={{ uri: this.state.thumbnailUrl }}
            video={{ uri: this.state.videoUrl }}
            videoWidth={this.state.video.width}
            videoHeight={this.state.video.height}
            duration={this.state.video.duration}
            endWithThumbnail={true}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{this.props.title}</Text>
          <TouchableHighlight onPress={() => this.showShareActionSheet(this.props.shortCode)} style={styles.share} underlayColor={'transparent'}>
            <Image source={require('./share-arrow.png')} style={{width: 25, height: 25}} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  button: {
    marginBottom: 10,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row-reverse',
  },
  video: {
    borderColor: 'black',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: 'black'
  },
  time: {
    fontSize: 10,
    marginRight: 5,
    marginBottom: 2,
    color: '#444444'
  },
  title: {
    flex: 8,
    fontSize: 14,
    paddingTop: 5,
    paddingRight: 5
  },
  share: {
    flex: 1,
    alignSelf: 'center',
    paddingTop: 5
  },
  view: {
    paddingTop: 20
  },
  centering: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300
  }
});