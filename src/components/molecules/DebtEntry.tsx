import React, {useState, memo, useCallback} from 'react';
import {View, TextInput, TouchableOpacity} from 'react-native';
import AppHeader from '../../components/atoms/AppHeader';
import CustomInput from '../../components/atoms/CustomInput';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import PrimaryView from '../../components/atoms/PrimaryView';
import {goBack} from '../../utils/navigationUtils';
import useThemeColors from '../../hooks/useThemeColors';
import {createDebt, updateDebtById} from '../../watermelondb/services';
import {useDispatch, useSelector} from 'react-redux';
import {selectUserId} from '../../redux/slice/userIdSlice';
import {fetchAllDebts} from '../../redux/slice/allDebtDataSlice';
import {fetchDebtsByDebtor} from '../../redux/slice/debtDataSlice';
import 日期Picker from '../atoms/日期Picker';
import {DebtsScreenProp} from '../../screens/AddDebtsScreen';
import {getISO日期Time} from '../../utils/dateUtils';
import {expense金额Schema, expenseSchema} from '../../utils/validationSchema';
import PrimaryText from '../atoms/PrimaryText';
import {selectCurrencySymbol} from '../../redux/slice/currencyDataSlice';
import {AppDispatch} from '../../redux/store';
import {gs} from '../../styles/globalStyles';

interface DebtEntryProps {
  buttonText: string;
  route: DebtsScreenProp;
}

const DebtEntry: React.FC<DebtEntryProps> = ({buttonText, route}) => {
  const colors = useThemeColors();
  const dispatch = useDispatch<AppDispatch>();
  const currencySymbol = useSelector(selectCurrencySymbol);
  const {debtId = '', debt备注 = '', amount = 0, debtorName = '', debt日期 = '', debtorId = '', debtType = 'Borrow'} = route.params ?? {};
  const isAddButton = buttonText === 'Add';
  const [hasInteracted, setHasInteracted] = useState(false);
  const [debtName, setDebtName] = useState(isAddButton ? '' : debt备注);
  const [debt金额, setDebt金额] = useState(isAddButton ? '' : String(amount));
  const [createdAt, setCreatedAt] = useState(isAddButton ? getISO日期Time() : debt日期);
  const [show日期Picker, setShow日期Picker] = useState(false);
  const [debtsType, setDebtsType] = useState(isAddButton ? 'Borrow' : debtType);
  const userId = useSelector(selectUserId);

  const debt金额Error = hasInteracted ? expense金额Schema?.safeParse(Number(debt金额)).error?.issues || [] : [];

  const isValid =
    expenseSchema.safeParse(debtName).success && expense金额Schema.safeParse(Number(debt金额)).success;

  const handleAddDebt = useCallback(async () => {
    if (!isValid) {
      return;
    }
    try {
      await createDebt(userId, Number(debt金额), debtName, debtorId, createdAt, debtsType);
      dispatch(fetchAllDebts());
      dispatch(fetchDebtsByDebtor(debtorId));
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating debt:', error);
      }
    }
  }, [isValid, userId, debt金额, debtName, debtorId, createdAt, debtsType, dispatch]);

  const handleUpdateDebt = useCallback(async () => {
    if (!isValid) {
      return;
    }
    try {
      await updateDebtById(debtId, debtorId, Number(debt金额), debtName, createdAt, debtsType);

      dispatch(fetchAllDebts());
      dispatch(fetchDebtsByDebtor(debtorId));
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating debt:', error);
      }
    }
  }, [isValid, debtId, debtorId, debt金额, debtName, createdAt, debtsType, dispatch]);

  const handleTextInputFocus = useCallback(() => {
    setHasInteracted(true);
  }, []);

  return (
    <PrimaryView colors={colors} style={gs.justifyBetween} dismissKeyboardOnTouch>
      <View>
        <View style={[gs.mb20, gs.mt20]}>
          <AppHeader onPress={goBack} colors={colors} text={isAddButton ? '添加债务' : '编辑债务'} />
        </View>

        <PrimaryText size={12} color={colors.secondaryText} style={gs.mb8}>
          {debtorName}
        </PrimaryText>
        <View style={[gs.row, gs.gap8, gs.mb15]}>
          {(['Borrow', 'Lend'] as const).map(t => {
            const isSelected = debtsType === t;
            const label = t === 'Borrow' ? '借入' : '借出';
            let bgColor = colors.secondaryAccent;
            if (isSelected && t === 'Borrow') {
              bgColor = colors.accentOrange;
            } else if (isSelected) {
              bgColor = colors.accentGreen;
            }
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setDebtsType(t)}
                activeOpacity={0.7}
                style={[
                  gs.py8,
                  gs.px14,
                  gs.rounded12,
                  gs.center,
                  {backgroundColor: bgColor},
                ]}>
                <PrimaryText
                  size={13}
                  weight={isSelected ? 'semibold' : 'regular'}
                  color={isSelected ? colors.buttonText : colors.primaryText}>
                  {label}
                </PrimaryText>
              </TouchableOpacity>
            );
          })}
        </View>

        <CustomInput
          colors={colors}
          input={debtName}
          setInput={setDebtName}
          placeholder="例如：咖啡"
          label="备注"
          schema={expenseSchema}
        />

        <PrimaryText size={12} color={colors.secondaryText} style={gs.mb5}>金额</PrimaryText>
        <View
          style={[
            gs.h48,
            gs.itemsCenter,
            gs.rounded12,
            gs.pl10,
            gs.justifyStart,
            gs.row,
            {
              backgroundColor: colors.secondaryAccent,
              marginBottom: debt金额Error.length > 0 ? 5 : 15,
            },
          ]}>
          <PrimaryText size={15} variant="number" color={colors.secondaryText}>{currencySymbol}</PrimaryText>
          <TextInput
            style={[gs.px15, gs.h48, gs.wFull, gs.numMedium, gs.noFontPadding, {color: colors.primaryText}]}
            value={debt金额}
            onChangeText={setDebt金额}
            placeholder={'0'}
            onChange={handleTextInputFocus}
            placeholderTextColor={colors.secondaryText}
            keyboardType="numeric"
          />
        </View>
        {debt金额Error.length > 0 && (
          <View style={gs.mb10}>
            {debt金额Error.map((error: {message: string}) => (
              <View key={error.message}>
                <PrimaryText size={12} color={colors.accentRed}>
                  {error.message}
                </PrimaryText>
              </View>
            ))}
          </View>
        )}

        <日期Picker
          setShow日期Picker={setShow日期Picker}
          createdAt={createdAt}
          show日期Picker={show日期Picker}
          setCreatedAt={setCreatedAt}
          label="日期"
        />
      </View>

      <View style={gs.mb10p}>
        <PrimaryButton
          onPress={isAddButton ? handleAddDebt : handleUpdateDebt}
          colors={colors}
          buttonTitle={isAddButton ? 'Add' : 'Update'}
          disabled={!isValid}
        />
      </View>
    </PrimaryView>
  );
};

export default memo(DebtEntry);
