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
import { Platform, PermissionsAndroid } from "react-native";
import Geolocation from "react-native-geolocation-service";

const App = () => {
  const BASE_URL = 'https://swingandslide.net';
  // const BASE_URL = 'http://10.0.0.203:3000';

  // 로딩, 스플래쉬 화면 (iOS)
  useEffect(()=>{
    setTimeout(()=>{
      SplashScreen.hide();
    },2000)
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
          sendMessageToWebview("CALL", "CLOSE_GALLERY");
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

  // 웹뷰에서 메시지 수신
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
        case "REQ" :
          requestPermission(data.value);
          break; 
      }
    }catch(e) { 
      console.log(e)
    }
  }


  // 위치 퍼미션 얻기
  async function requestPermission(per) {
    let permissionString = null;
    let permissionResult = null;
    switch (per) {
      case "REQ_ACCESS_FINE_LOCATION" :
        permissionString = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
        break;
    }
  
    try {
      if (Platform.OS === "ios") {
        permissionResult = await Geolocation.requestAuthorization("always");
      }
      // 안드로이드 위치 정보 수집 권한 요청
      if (Platform.OS === "android") {
        permissionResult = await PermissionsAndroid.request(permissionString);
      }
    } catch (e) {
      console.log(e);
    }

    // 퍼미션 허용 후 웹뷰에 메시지 
    if(permissionResult === "granted") {
      Geolocation.getCurrentPosition(
        pos => {
          sendMessageToWebview("GRANTED", {lat:pos.coords.latitude, lng:pos.coords.longitude})
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 3600,
          maximumAge: 3600,
        },
      );
    }

  }
  
  function sendMessageToWebview(type, value) {
    webview.current.postMessage(JSON.stringify({'type': type, 'value': value}));
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
          // onShouldStartLoadWithRequest={event => {
          //   //외부링크
          //   if (!event.url.startsWith(BASE_URL)) {
          //     Linking.openURL(event.url);
          //     return false;
          //   }
          //   return true;
          // }} // 안드로이드에서는 괜찮은데 ios에서 문제가 생겨서 주석처리함 230822
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