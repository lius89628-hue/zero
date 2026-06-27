import {ScrollView, TextInput, View} from 'react-native';
import React, {useCallback, useEffect, useState, memo} from 'react';
import PrimaryView from '../atoms/PrimaryView';
import AppHeader from '../atoms/AppHeader';
import CustomInput from '../atoms/CustomInput';
import PrimaryText from '../atoms/PrimaryText';
import 分类Container from './分类Container';
import PrimaryButton from '../atoms/PrimaryButton';
import useThemeColors from '../../hooks/useThemeColors';
import {goBack, navigate} from '../../utils/navigationUtils';
import {useDispatch, useSelector} from 'react-redux';
import {selectCurrencySymbol} from '../../redux/slice/currencyDataSlice';
import {selectUserId} from '../../redux/slice/userIdSlice';
import {fetchCategories, selectActiveCategories} from '../../redux/slice/categoryDataSlice';
import {createExpense, updateExpenseById} from '../../watermelondb/services';
import {fetchExpensesByMonth, invalidateExpenseCache} from '../../redux/slice/expenseDataSlice';
import DatePicker from '../atoms/DatePicker';
import {getISODateTime, formatDate} from '../../utils/dateUtils';
import {ensureYearInCache} from '../../utils/availableYearsCache';
import {expense金额Schema, expense备注Schema, expenseSchema} from '../../utils/validationSchema';
import {分类Data as 分类DocType} from '../../watermelondb/services';
import {AppDispatch} from '../../redux/store';
import {gs} from '../../styles/globalStyles';

interface ExpenseEntryProps {
  type: string;
  route?: any;
}

const ExpenseEntry: React.FC<ExpenseEntryProps> = ({type, route}) => {
  const expenseData = route?.params;
  const is添加Button = type === '添加';
  const [hasInteracted, setHasInteracted] = useState(false);
  const categories = useSelector(selectActiveCategories);
  const [selectedCategories, setSelectedCategories] = useState<分类DocType[]>(
    is添加Button
      ? []
      : categories?.filter((category: 分类DocType) => category?.name === expenseData?.category?.name) ?? [],
  );

  const [createdAt, setCreatedAt] = useState(is添加Button ? getISODateTime() : expenseData?.expenseDate ?? getISODateTime());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expense标题, setExpense标题] = useState(is添加Button ? '' : expenseData?.expense标题 ?? '');
  const [expense备注, setExpense备注] = useState(is添加Button ? '' : expenseData?.expense备注 ?? '');
  const [expense金额, setExpense金额] = useState(is添加Button ? '' : String(expenseData?.expense金额 ?? ''));

  const expense金额Error = hasInteracted
    ? expense金额Schema?.safeParse(Number(expense金额)).error?.issues || []
    : [];

  const isValid =
    expenseSchema.safeParse(expense标题).success &&
    expense备注Schema.safeParse(expense备注).success &&
    expense金额Schema.safeParse(Number(expense金额)).success;

  const userId = useSelector(selectUserId);
  const currencySymbol = useSelector(selectCurrencySymbol);
  const dispatch = useDispatch<AppDispatch>();

  const colors = useThemeColors();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handle添加分类 = useCallback(() => {
    navigate('添加分类Screen');
  }, []);

  const handleTextInputFocus = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const handle添加Expense = useCallback(async () => {
    if (!isValid || selectedCategories.length === 0) {
      return;
    }
    const categoryId = selectedCategories[0].id;
    try {
      await createExpense(userId, expense标题, Number(expense金额), expense备注, categoryId, createdAt);

      const yearMonth = formatDate(createdAt, 'YYYY-MM');
      const year = Number.parseInt(formatDate(createdAt, 'YYYY'), 10);
      ensureYearInCache(year);
      dispatch(invalidateExpenseCache());
      await dispatch(fetchExpensesByMonth(yearMonth));
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating expense:', error);
      }
    }
  }, [isValid, selectedCategories, userId, expense标题, expense金额, expense备注, createdAt, dispatch]);

  const handle更新Expense = useCallback(async () => {
    if (!isValid || selectedCategories.length === 0) {
      return;
    }
    const categoryId = selectedCategories[0].id;
    try {
      await updateExpenseById(
        expenseData?.expenseId,
        categoryId,
        expense标题,
        Number(expense金额),
        expense备注,
        createdAt,
      );

      const yearMonth = formatDate(createdAt, 'YYYY-MM');
      const year = Number.parseInt(formatDate(createdAt, 'YYYY'), 10);
      ensureYearInCache(year);
      dispatch(invalidateExpenseCache());
      await dispatch(fetchExpensesByMonth(yearMonth));
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating expense:', error);
      }
    }
  }, [
    isValid,
    selectedCategories,
    expenseData?.expenseId,
    expense标题,
    expense金额,
    expense备注,
    createdAt,
    dispatch,
  ]);

  const toggle分类Selection = useCallback(
    (category: 分类DocType) => {
      if (selectedCategories.includes(category)) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories([category]);
      }
    },
    [selectedCategories],
  );

  return (
    <PrimaryView colors={colors} dismissKeyboardOnTouch>
      <View style={[gs.mb20, gs.mt20]}>
        <AppHeader onPress={() => goBack()} colors={colors} text={is添加Button ? '添加记录' : '编辑记录'} />
      </View>

      <CustomInput
        colors={colors}
        input={expense标题}
        setInput={setExpense标题}
        placeholder="例如：午餐"
        label="标题"
        schema={expenseSchema}
      />
      <CustomInput
        colors={colors}
        input={expense备注}
        setInput={setExpense备注}
        placeholder="例如：在公司附近"
        label="备注"
        schema={expense备注Schema}
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
            marginBottom: expense金额Error.length > 0 ? 5 : 15,
          },
        ]}>
        <PrimaryText size={15} variant="number" color={colors.secondaryText}>{currencySymbol}</PrimaryText>
        <TextInput
          style={[gs.px15, gs.h48, gs.wFull, gs.numMedium, gs.noFontPadding, {color: colors.primaryText}]}
          value={expense金额}
          onChangeText={setExpense金额}
          placeholder={'0'}
          onChange={handleTextInputFocus}
          placeholderTextColor={colors.secondaryText}
          keyboardType="numeric"
        />
      </View>
      {expense金额Error.length > 0 && (
        <View style={gs.mb10}>
          {expense金额Error.map((error: {message: string}) => (
            <View key={error.message}>
              <PrimaryText size={12} color={colors.accentRed}>
                {error.message}
              </PrimaryText>
            </View>
          ))}
        </View>
      )}

      <DatePicker
        setShowDatePicker={setShowDatePicker}
        createdAt={createdAt}
        showDatePicker={showDatePicker}
        setCreatedAt={setCreatedAt}
        label="Date"
      />

      <PrimaryText size={12} color={colors.secondaryText} style={gs.mb8}>分类</PrimaryText>
      <ScrollView showsVerticalScrollIndicator={false}>
        <分类Container
          categories={categories}
          colors={colors}
          toggle分类Selection={toggle分类Selection}
          selectedCategories={selectedCategories}
        />
        <PrimaryButton
          onPress={handle添加分类}
          colors={colors}
          button标题="添加 分类"
          variant="ghost"
          size="sm"
          fullWidth={false}
        />
      </ScrollView>
      <View style={gs.mt5}>
        <PrimaryButton
          onPress={is添加Button ? handle添加Expense : handle更新Expense}
          colors={colors}
          button标题={is添加Button ? '添加' : '更新'}
          disabled={!isValid}
        />
      </View>
    </PrimaryView>
  );
};

export default memo(ExpenseEntry);
