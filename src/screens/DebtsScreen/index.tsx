import {TouchableOpacity, View} from 'react-native';
import React, {useMemo} from 'react';
import HeaderContainer from '../../components/molecules/HeaderContainer';
import {navigate} from '../../utils/navigationUtils';
import Icon from '../../components/atoms/Icons';
import DebtorList from '../../components/molecules/DebtorList';
import use债务 from './use债务';
import PrimaryView from '../../components/atoms/PrimaryView';
import PrimaryText from '../../components/atoms/PrimaryText';
import EmptyState from '../../components/atoms/EmptyState';
import {formatCurrency} from '../../utils/numberUtils';
import {gs, hitSlop} from '../../styles/globalStyles';

const 债务Screen = () => {
  const {
    colors,
    all债务,
    debtorType,
    setDebtorType,
    currencySymbol,
    personDebtors,
    other账户Debtors,
    total债务,
    debtors,
  } = use债务();

  const overallLabel = useMemo(() => {
    if (total债务 > 0) return '你欠别人';
    if (total债务 < 0) return '别人欠你';
    return '全部结清';
  }, [total债务]);

  const amountColor = useMemo(() => {
    if (total债务 > 0) return colors.accentOrange;
    if (total债务 < 0) return colors.accentGreen;
    return colors.primaryText;
  }, [total债务, colors]);

  const ListHeader = useMemo(() => (
    <View style={gs.mx16}>
      <View
        style={[
          gs.py12,
          gs.px14,
          gs.rounded12,
          gs.mb15,
          gs.center,
          {backgroundColor: colors.containerColor},
        ]}>
        <PrimaryText size={11} weight="medium" color={colors.secondaryText} style={gs.mb5}>
          {overallLabel}
        </PrimaryText>
        <PrimaryText size={28} weight="bold" variant="number" color={amountColor}>
          {currencySymbol}{formatCurrency(Math.abs(total债务))}
        </PrimaryText>
        <View style={[gs.rowCenter, gs.gap6, gs.mt6]}>
          <PrimaryText size={11} color={colors.secondaryText} variant="number">
            {personDebtors.length} person{personDebtors.length === 1 ? '' : 's'}
          </PrimaryText>
          <PrimaryText size={11} color={colors.secondaryText}>·</PrimaryText>
          <PrimaryText size={11} color={colors.secondaryText} variant="number">
            {other账户Debtors.length} account{other账户Debtors.length === 1 ? '' : 's'}
          </PrimaryText>
        </View>
      </View>

      <View style={[gs.row, gs.gap8, gs.mb15]}>
        <TouchableOpacity
          onPress={() => setDebtorType('个人')}
          activeOpacity={0.7}
          style={[
            gs.py8,
            gs.px14,
            gs.rounded12,
            {
              backgroundColor: debtorType === '个人' ? colors.primaryText : colors.secondaryAccent,
            },
          ]}>
          <PrimaryText
            size={13}
            weight="semibold"
            color={debtorType === '个人' ? colors.buttonText : colors.secondaryText}>
            个人
          </PrimaryText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDebtorType('Other')}
          activeOpacity={0.7}
          style={[
            gs.py8,
            gs.px14,
            gs.rounded12,
            {
              backgroundColor: debtorType === 'Other' ? colors.primaryText : colors.secondaryAccent,
            },
          ]}>
          <PrimaryText
            size={13}
            weight="semibold"
            color={debtorType === 'Other' ? colors.buttonText : colors.secondaryText}>
            账户
          </PrimaryText>
        </TouchableOpacity>
      </View>
    </View>
  ), [amountColor, colors, currencySymbol, debtorType, overallLabel, other账户Debtors.length, personDebtors.length, setDebtorType, total债务]);

  return (
    <PrimaryView colors={colors} useBottomPadding={false} useSidePadding={false}>
      <View style={[gs.px16, gs.mb15]}>
        <HeaderContainer headerText={'债务'} />
      </View>
      {debtors.length === 0 ? (
        <View style={gs.px16}>
          <EmptyState colors={colors} type={'债务'} style={gs.mt30p} />
        </View>
      ) : (
        <DebtorList
          colors={colors}
          debtors={debtorType === '个人' ? personDebtors : other账户Debtors}
          all债务={all债务}
          currencySymbol={currencySymbol}
          ListHeaderComponent={ListHeader}
        />
      )}
      <View style={[gs.absolute, gs.bottom15, gs.right15, gs.zIndex1]}>
        <TouchableOpacity
          style={[gs.size50, gs.rounded8, gs.center, {backgroundColor: colors.secondaryBackground}]}
          onPress={() => navigate('AddDebtorScreen')}
          hitSlop={hitSlop}
          accessibilityLabel="添加新债务人"
          accessibilityRole="button">
          <Icon name="plus-circle" size={30} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
    </PrimaryView>
  );
};

export default 债务Screen;
