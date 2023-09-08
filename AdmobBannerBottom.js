import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

const unitID =
  Platform.select({
    ios: 'ca-app-pub-4742756646856813~7868754955',
    android: 'ca-app-pub-4742756646856813~7868754955',
  }) || '';

const adUnitId = __DEV__ ? TestIds.BANNER : unitID;

const AdmobBannerBottom = () => {
  return (
    <View style={styles.admob}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  admob: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default AdmobBannerBottom;