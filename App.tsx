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
import { Linking } from 'react-native';

const App = () => {
  const BASE_URL = 'https://swingandslide.net';
  // const BASE_URL = 'http://10.0.0.203:3000';

  // 로딩, 스플래쉬 화면 (iOS)
  useEffect(()=>{
    setTimeout(()=>{
      SplashScreen.hide();
    },1500)
  },[]);

  // 백 버튼 (안드로이드)
  const webview = useRef();
  let goBackCnt = 1;
  const [goBack, setGoBack] = useState(false);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isGalleryActive) {
          webview.current.postMessage(JSON.stringify({type: "CALL", value: "CLOSE_GALLERY"}));
          return true;
        }

        if (goBackCnt < goBack) {
          webview.current.goBack();
          goBackCnt++;
        }
        else return false;
        return true;
      },
    );
    return () => backHandler.remove();
  }, [goBack, isGalleryActive]);

  /* 최초 페이지까지 왔을 때 앱이 종료되도록 함 230820
  const handleClose = ()=>{
    Alert.alert('앱 종료', '앱을 종료하시겠습니까?', [
      {
        text: '아니오',
        onPress: () => null,
      },
      {text: '예', onPress: () => BackHandler.exitApp()},
    ]);
  };
  */

  const onHandleMessageFromWebview = (e) => {
    try{
      const data = JSON.parse(e.nativeEvent.data)
      switch(data.type) {
        case "URL" :
          // setGoBack(data.value !== BASE_URL);
          setGoBack(data.value);
          break;
        case "GALLERY" :
          setIsGalleryActive(data.value);
          break;
      }
    }catch(e) { 
      console.log(e)
    }
  }

  return (
  <SafeAreaView style={styles.container}>
      <WebView
          ref={webview}
          style={styles.webview}
          pullToRefreshEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          source={{ uri: BASE_URL }}
          onMessage={onHandleMessageFromWebview}
          onShouldStartLoadWithRequest={event => {
            //외부링크
            if (!event.url.startsWith(BASE_URL)) {
              Linking.openURL(event.url);
              return false;
            }
            return true;
          }}
          injectedJavaScript={`
            (function() {
                function wrap(fn) {
                  return function wrapper() {
                      var res = fn.apply(this, arguments);
                      window.ReactNativeWebView.postMessage(JSON.stringify({type: "URL", value:history.length}));
                      return res;
                  }
                }
                history.pushState = wrap(history.pushState);
                history.replaceState = wrap(history.replaceState);
                window.addEventListener('popstate', function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({type: "URL", value:history.length}));
                });

            })();
            true;
          `}
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