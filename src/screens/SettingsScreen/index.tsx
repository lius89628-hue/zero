import {ScrollView, Text, TouchableOpacity, View, Platform, Share} from 'react-native';
import React, {useCallback} from 'react';
import Icon from '../../components/atoms/Icons';
import {goBack} from '../../utils/navigationUtils';
import use设置 from './use设置';
import PrimaryView from '../../components/atoms/PrimaryView';
import PrimaryText from '../../components/atoms/PrimaryText';
import RNFS from 'react-native-fs';
import {generateUniqueKey, requestStoragePermission} from '../../utils/dataUtils';
import {getTimestamp} from '../../utils/dateUtils';
import {CURRENT_EXPORT_VERSION} from '../../backend/export/format';
import {SheetManager} from 'react-native-actions-sheet';
import {Colors} from '../../hooks/use主题Colors';
import {gs, hitSlop} from '../../styles/globalStyles';

interface 设置RowProps {
  icon: string;
  label: string;
  subtitle?: string;
  value?: string;
  valueNode?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  colors: Colors;
}

const 设置Row: React.FC<设置RowProps> = ({icon, label, subtitle, value, valueNode, onPress, destructive, colors}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.6 : 1} disabled={!onPress}>
    <View style={[gs.rowCenter, gs.px14, gs.py12, gs.gap10]}>
      <View style={[gs.size32, gs.rounded8, gs.center, {backgroundColor: colors.secondaryAccent}]}>
        <Icon name={icon} size={16} color={destructive ? colors.accentOrange : colors.secondaryText} />
      </View>
      <View style={[gs.flex1, gs.gap2]}>
        <PrimaryText size={14} weight="medium" color={destructive ? colors.accentOrange : colors.primaryText}>
          {label}
        </PrimaryText>
        {subtitle ? (
          <PrimaryText size={11} color={colors.secondaryText}>{subtitle}</PrimaryText>
        ) : null}
      </View>
      {value ? (
        <PrimaryText size={13} color={colors.secondaryText}>{value}</PrimaryText>
      ) : null}
      {valueNode ?? null}
      {onPress ? <Icon name="chevron-right" size={14} color={colors.secondaryText} /> : null}
    </View>
  </TouchableOpacity>
);

const 设置Screen = () => {
  const {
    app版本,
    colors,
    handle主题Selection,
    handle名称Update,
    handle货币Update,
    selected主题,
    user名称,
    currencySymbol,
    currency名称,
    handleReportBug,
    handleRateNow,
    handleGithub,
    handlePrivacyPolicy,
    handleTermsAndConditions,
    handleDeleteAllData,
    allData,
    handleExportResult,
    requestStorageViaDialog,
  } = use设置();

  const handleOpen货币Sheet = useCallback(() => {
    void SheetManager.show('currency-picker-sheet', {
      payload: {
        selected货币: {code: '', name: currency名称, symbol: currencySymbol},
        onSelect: (currency: {code: string; name: string; symbol: string}) => {
          handle货币Update(currency);
        },
      },
    });
  }, [currency名称, currencySymbol, handle货币Update]);

  const exportData = async (dataToExport: unknown) => {
    try {
      if (!dataToExport) {
        handleExportResult(false);
        return;
      }

      const currentDateAndTime = getTimestamp();
      const file名称 = `zero_v${CURRENT_EXPORT_VERSION}_${currentDateAndTime}.json`;
      const jsonData = JSON.stringify({key: generateUniqueKey(), version: CURRENT_EXPORT_VERSION, data: dataToExport}, null, 2);

      if (Platform.OS === 'ios') {
        const path = `${RNFS.DocumentDirectoryPath}/${file名称}`;

        await RNFS.writeFile(path, jsonData, 'utf8');

        await Share.share({
          url: `file://${path}`,
          title: 'Export Zero Data',
        });

        handleExportResult(true);
      } else {
        const storagePermissionGranted = await requestStoragePermission();

        if (!storagePermissionGranted) {
          requestStorageViaDialog();
          return;
        }

        const path = `${RNFS.DownloadDirectoryPath}/${file名称}`;

        await RNFS.writeFile(path, jsonData, 'utf8');
        handleExportResult(true);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving file:', error);
      }
      handleExportResult(false);
    }
  };

  const open主题Picker = useCallback(() => {
    void SheetManager.show('theme-picker-sheet', {
      payload: {
        current主题: selected主题,
        onSelect: (theme: string) => {
          handle主题Selection(theme);
        },
      },
    });
  }, [selected主题, handle主题Selection]);

  return (
    <PrimaryView colors={colors} dismissKeyboardOnTouch>
      <View style={[gs.rowCenter, gs.gap10, gs.mt5p]}>
        <TouchableOpacity onPress={() => goBack()} hitSlop={hitSlop}>
          <Icon name="arrow-left" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <PrimaryText size={22} weight="semibold">设置</PrimaryText>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={gs.pb80}>
        <PrimaryText
          size={11}
          weight="semibold"
          color={colors.accentGreen}
          style={[gs.mt20, gs.mb6, {letterSpacing: 0.8}]}>
          个性化
        </PrimaryText>
        <View style={[gs.rounded12, gs.overflowHidden, {backgroundColor: colors.containerColor}]}>
          <设置Row
            colors={colors}
            icon="sun-moon"
            label="主题"
            value={selected主题.charAt(0).toUpperCase() + selected主题.slice(1)}
            onPress={open主题Picker}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="user"
            label="名称"
            value={user名称}
            onPress={() => {
              void SheetManager.show('change-name-sheet', {
                payload: {
                  current名称: user名称,
                  onUpdate: (new名称: string) => {
                    handle名称Update(new名称);
                  },
                },
              });
            }}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="banknote"
            label="货币"
            onPress={handleOpen货币Sheet}
            valueNode={
              <View style={gs.itemsEnd}>
                <PrimaryText size={13} color={colors.secondaryText} variant="number">{currencySymbol}</PrimaryText>
                <PrimaryText size={10} color={colors.secondaryText}>{currency名称}</PrimaryText>
              </View>
            }
          />
        </View>

        <PrimaryText
          size={11}
          weight="semibold"
          color={colors.accentGreen}
          style={[gs.mt20, gs.mb6, {letterSpacing: 0.8}]}>
          你的数据
        </PrimaryText>
        <View style={[gs.rounded12, gs.overflowHidden, {backgroundColor: colors.containerColor}]}>
          <设置Row
            colors={colors}
            icon="download"
            label="导出数据"
            subtitle="稍后可在新设备上导入"
            onPress={() => exportData(allData)}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="trash-2"
            label="删除所有数据"
            subtitle="此操作无法撤销"
            onPress={handleDeleteAllData}
            destructive
          />
        </View>

        <PrimaryText
          size={11}
          weight="semibold"
          color={colors.accentGreen}
          style={[gs.mt20, gs.mb6, {letterSpacing: 0.8}]}>
          关于
        </PrimaryText>
        <View style={[gs.rounded12, gs.overflowHidden, {backgroundColor: colors.containerColor}]}>
          <设置Row
            colors={colors}
            icon="bug"
            label="报告问题"
            subtitle="发现问题？告诉我们"
            onPress={handleReportBug}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="star"
            label="评价应用"
            subtitle="喜欢 zero？你的反馈很重要！"
            onPress={handleRateNow}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="code"
            label="源代码"
            subtitle="在 GitHub 上查看"
            onPress={handleGithub}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="shield"
            label="隐私政策"
            onPress={handlePrivacyPolicy}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="file-text"
            label="使用条款"
            onPress={handleTermsAndConditions}
          />
          <View style={[gs.mx16, {height: 1, backgroundColor: colors.secondaryAccent}]} />
          <设置Row
            colors={colors}
            icon="info"
            label="版本"
            value={`v${app版本}`}
          />
        </View>

        <View style={[gs.mt20, gs.mb10, gs.center, gs.gap2]}>
          <PrimaryText size={11} color={colors.secondaryText}>
            拥抱 zero 的简洁
          </PrimaryText>
          <PrimaryText size={11} color={colors.secondaryText}>
            用 <Text style={{color: colors.accentGreen}}>热情</Text> 在印度制作
          </PrimaryText>
        </View>
      </ScrollView>

    </PrimaryView>
  );
};

export default 设置Screen;
