import React from 'react';
import WebView from 'react-native-webview';
import { SafeAreaView, 
         StyleSheet, 
         Dimensions, 
         BackHandler, 
         Alert } from 'react-native';
import { useEffect, 
         useState, 
         useRef } from 'react';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  const BASE_URL = 'https://swingandslide.net';

  // 로딩, 스플래쉬 화면 (iOS)
  useEffect(()=>{
    setTimeout(()=>{
      SplashScreen.hide();
    },1500)
  },[]);

  // 백 버튼 (안드로이드)
  const webview = useRef();
  const [goBack, setGoBack] = useState(false);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // console.log('goBack', goBack);
        if (goBack) webview.current.goBack();
        else handleClose();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [goBack]);

  const handleClose = ()=>{
    Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
      {
        text: '아니오',
        onPress: () => null,
      },
      {text: '예', onPress: () => BackHandler.exitApp()},
    ]);
  };

  return (
  <SafeAreaView style={styles.container}>
      <WebView
          ref={webview}
          style={styles.webview}
          pullToRefreshEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          source={{ uri: BASE_URL }}
          injectedJavaScript={`
            (function() {
                function wrap(fn) {
                return function wrapper() {
                    var res = fn.apply(this, arguments);
                    window.ReactNativeWebView.postMessage(window.location.href);
                    return res;
                }
                }
                history.pushState = wrap(history.pushState);
                history.replaceState = wrap(history.replaceState);
                window.addEventListener('popstate', function() {
                window.ReactNativeWebView.postMessage(window.location.href);
                });
            })();
            true;
          `}
          onMessage={(event) => {
            const url = event.nativeEvent.data;
            setGoBack(url !== BASE_URL);
            // console.log('onMessage', event.nativeEvent.data);
          }}
      />
    </SafeAreaView>
  );
};

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = (Dimensions.get('window').height);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  webview: {
    flex: 1,
    width: deviceWidth,
    height: deviceHeight,
  },
});

export default App;