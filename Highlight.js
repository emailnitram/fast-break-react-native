import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ActionSheetIOS,
  TouchableHighlight
} from 'react-native';

import VideoPlayer from 'react-native-video-player';

const VIMEO_ID = '179859217';

export default class Highlight extends Component {

  constructor() {
    super();

    this.state = {
      video: { width: undefined, height: undefined, duration: undefined },
      thumbnailUrl: undefined,
      videoUrl: undefined,
      title: undefined,
      shortCode: undefined
    };
  }

  componentDidMount() {
    // console.log('this', this.props.video)
    // let shortcode = this.props.video
    global.fetch(`https://api.streamable.com/videos/${this.props.shortCode}`)
      .then(res => res.json())
      // .then(res => console.log('res',res.thumbnail_url))
      .then(res => this.setState({
        shortCode: this.props.shortCode,
        thumbnailUrl: `https:${res.thumbnail_url}`,
        videoUrl: `https:${res.files['mp4-mobile'].url}`,
        video: { 
          width: res.files['mp4-mobile'].width,
          height: res.files['mp4-mobile'].height,
          duration: res.files['mp4-mobile'].duration
        }
      }));
  }

  showShareActionSheet(shortCode) {
    ActionSheetIOS.showShareActionSheetWithOptions({
      url: `https://streamable.com/${shortCode}`,
      message: this.props.title,
      subject: 'a subject to go in the email heading',
      excludedActivityTypes: [
        'com.apple.UIKit.activity.PostToTwitter'
      ]
    },
    (error) => alert(error),
    (success, method) => {
      var text;
      if (success) {
        text = `Shared via ${method}`;
      } else {
        text = 'You didn\'t share';
      }
      this.setState({text});
    });
  };

  render() {
    return (
      <View style={styles.view}>
        <Text style={styles.title}>{this.props.title}</Text>
        <TouchableHighlight onPress={() => this.showShareActionSheet(this.state.shortCode)}>
          <Image source={require('./share.png')} style={{width: 19, height: 27}} />
        </TouchableHighlight>
        <VideoPlayer
          thumbnail={{ uri: this.state.thumbnailUrl }}
          video={{ uri: this.state.videoUrl }}
          videoWidth={this.state.video.width}
          videoHeight={this.state.video.height}
          duration={this.state.video.duration/* I'm using a hls stream here, react-native-video
            can't figure out the length, so I pass it here from the vimeo config */}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    fontWeight: '500',
  },
  title: {
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 18
  },
  view: {
    marginBottom: 20
  }
});