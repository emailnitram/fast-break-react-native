import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  TouchableHighlight
} from 'react-native';

import VideoPlayer from 'react-native-video-player';
import timeAgo from 'time-ago';

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
      .then(res => this.setState({
        thumbnailUrl: `https:${res.thumbnail_url}`,
        videoUrl: `https:${res.files['mp4-mobile'].url}`,
        video: { 
          width: res.files['mp4-mobile'].width,
          height: res.files['mp4-mobile'].height,
          duration: res.files['mp4-mobile'].duration
        }
      }))
      .catch(error => this.setState({error: true}) );
  }

  showShareActionSheet(shortCode) {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: `https://streamable.com/${shortCode}`,
      message: this.props.title
    },
    (error) => alert(error),
    (success, method) => {
      var text;
      if (success) {
        text = `Shared via ${method}`;
      } else {
        text = 'You didn\'t share';
      }
      // this.setState({text});
    });
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
      return (
        <View>
          <Text style={styles.title}>Error loading Video</Text>
        </View>
      )
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
            duration={this.state.video.duration/* I'm using a hls stream here, react-native-video
              can't figure out the length, so I pass it here from the vimeo config */}
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