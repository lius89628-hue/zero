import {TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo, useState, memo} from 'react';
import PrimaryView from '../atoms/PrimaryView';
import AppHeader from '../atoms/AppHeader';
import CustomInput from '../atoms/CustomInput';
import PrimaryText from '../atoms/PrimaryText';
import 图标 from '../atoms/图标s';
import PrimaryButton from '../atoms/PrimaryButton';
import useTheme颜色s from '../../hooks/useTheme颜色s';
import {goBack} from '../../utils/navigationUtils';
import {useDispatch, useSelector} from 'react-redux';
import {selectUserId} from '../../redux/slice/userIdSlice';
import {createCategory, updateCategoryById} from '../../watermelondb/services';
import {fetchCategories, selectCategoryData} from '../../redux/slice/categoryDataSlice';
import {categorySchema} from '../../utils/validationSchema';
import defaultCategories from '../../../assets/jsons/defaultCategories.json';
import {FlashList} from '@shopify/flash-list';
import {SheetManager} from 'react-native-actions-sheet';
import {AppDispatch} from '../../redux/store';
import {gs} from '../../styles/globalStyles';

interface CategorySelection {
  name: string;
  icon?: string;
  color?: string;
}

interface CategoryEntryProps {
  type: string;
  route?: any;
}

const CategoryEntry: React.FC<CategoryEntryProps> = ({type, route}) => {
  const colors = useTheme颜色s();
  const dispatch = useDispatch<AppDispatch>();
  const categoryData = route?.params;
  const isAddButton = type === 'Add';

  const [categoryName, setCategoryName] = useState(isAddButton ? '' : categoryData?.categoryName ?? '');

  const resolve图标Param = (val?: string): string | null => {
    if (!val || val === 'null' || val === '') { return null; }
    return val;
  };

  const [selected图标, setSelected图标] = useState<string | null>(
    isAddButton ? null : resolve图标Param(categoryData?.category图标),
  );
  const [selected颜色, setSelected颜色] = useState<string | null>(
    isAddButton ? '#808080' : resolve图标Param(categoryData?.category颜色),
  );
  const [selectedCategories, setSelectedCategories] = useState<Array<CategorySelection>>([]);

  const selectedCategoryNames = useMemo(() => new Set(selectedCategories.map(c => c.name)), [selectedCategories]);

  const allCategories = useSelector(selectCategoryData) ?? [];
  const existingCategoryNamesSet = useMemo(
    () => new Set((allCategories ?? []).map((category: CategorySelection) => category.name)),
    [allCategories],
  );
  const filteredCategories = useMemo(
    () => defaultCategories.filter(category => !existingCategoryNamesSet.has(category.name)),
    [existingCategoryNamesSet],
  );

  const userId = useSelector(selectUserId);
  const isValid = categorySchema.safeParse(categoryName).success;

  const handleAddCategory = useCallback(async () => {
    try {
      await createCategory(categoryName, userId, selected图标, selected颜色);
      dispatch(fetchCategories());
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating category:', error);
      }
    }
  }, [categoryName, userId, selected图标, selected颜色, dispatch]);

  const handleAddFromDefaultCategory = useCallback(async () => {
    for (const category of selectedCategories) {
      await createCategory(category.name, userId, category.icon ?? null, category.color ?? null);
    }
    dispatch(fetchCategories());
    goBack();
  }, [selectedCategories, userId, dispatch]);

  const handleUpdateCategory = useCallback(async () => {
    try {
      await updateCategoryById(categoryData?.categoryId, categoryName, selected图标 ?? undefined, selected颜色 ?? undefined);
      dispatch(fetchCategories());
      goBack();
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating category:', error);
      }
    }
  }, [categoryData?.categoryId, categoryName, selected图标, selected颜色, dispatch]);

  const handleAddFromDefaultOrAddCategory = useCallback(() => {
    if (isAddButton) {
      if (selectedCategories.length > 0) {
        handleAddFromDefaultCategory();
      } else {
        handleAddCategory();
      }
    } else {
      handleUpdateCategory();
    }
  }, [isAddButton, selectedCategories.length, handleAddFromDefaultCategory, handleAddCategory, handleUpdateCategory]);

  const handleOpen图标Picker = useCallback(() => {
    SheetManager.show('icon-picker-sheet', {
      payload: {
        selected图标: selected图标 ?? undefined,
        onSelect: (icon: string) => {
          setSelected图标(icon);
          SheetManager.hide('icon-picker-sheet');
        },
      },
    });
  }, [selected图标]);

  const handleOpen颜色Picker = useCallback(() => {
    SheetManager.show('color-picker-sheet', {
      payload: {
        selected颜色: selected颜色 ?? undefined,
        onSelect: (color: string) => {
          setSelected颜色(color);
          SheetManager.hide('color-picker-sheet');
        },
      },
    });
  }, [selected颜色]);

  const toggleCategorySelection = useCallback(
    (category: CategorySelection) => {
      if (selectedCategoryNames.has(category.name)) {
        setSelectedCategories(prev => prev.filter(item => item.name !== category.name));
      } else {
        setSelectedCategories(prev => [...prev, category]);
      }
    },
    [selectedCategoryNames],
  );

  const renderDefaultCategoryItem = useCallback(
    ({item: category}: {item: CategorySelection}) => {
      const isSelected = selectedCategoryNames.has(category.name);

      return (
        <TouchableOpacity onPress={() => toggleCategorySelection(category)} activeOpacity={0.7}>
          <View
            style={[
              gs.py8,
              gs.px14,
              gs.mr8,
              gs.mt5,
              gs.rounded12,
              gs.rowCenter,
              gs.gap6,
              {background颜色: isSelected ? colors.primaryText : colors.secondaryAccent},
            ]}>
            {category.icon ? (
              <图标
                name={category.icon}
                size={16}
                color={isSelected ? colors.buttonText : (category.color ?? colors.secondaryText)}
              />
            ) : null}
            <PrimaryText
              size={13}
              weight={isSelected ? 'semibold' : 'regular'}
              color={isSelected ? colors.buttonText : colors.primaryText}>
              {category.name}
            </PrimaryText>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, selectedCategoryNames, toggleCategorySelection],
  );

  return (
    <PrimaryView colors={colors} style={gs.justifyBetween} dismissKeyboardOnTouch>
      <View>
        <View style={[gs.mb20, gs.mt20]}>
          <AppHeader onPress={goBack} colors={colors} text={isAddButton ? '添加分类' : '编辑分类'} />
        </View>

        <CustomInput
          colors={colors}
          input={categoryName}
          setInput={setCategoryName}
          placeholder="例如：文具"
          label="分类名称"
          schema={categorySchema}
        />

        <PrimaryText size={12} color={colors.secondaryText} style={gs.mb8}>外观</PrimaryText>
        <View style={[gs.row, gs.gap8, gs.mb15]}>
          <TouchableOpacity
            onPress={handleOpen图标Picker}
            activeOpacity={0.7}
            style={[
              gs.py10,
              gs.px14,
              gs.rounded12,
              gs.rowCenter,
              gs.gap8,
              gs.flex1,
              {background颜色: colors.secondaryAccent},
            ]}>
            <View
              style={[
                gs.size32,
                gs.roundedFull,
                gs.center,
                {background颜色: colors.container颜色},
              ]}>
              <图标
                name={selected图标 ?? 'shapes'}
                size={16}
                color={colors.primaryText}
              />
            </View>
            <View style={gs.flex1}>
              <PrimaryText size={11} color={colors.secondaryText}>图标</PrimaryText>
              <PrimaryText size={13} weight="medium">
                {selected图标 ? '更换' : '选择'}
              </PrimaryText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpen颜色Picker}
            activeOpacity={0.7}
            style={[
              gs.py10,
              gs.px14,
              gs.rounded12,
              gs.rowCenter,
              gs.gap8,
              gs.flex1,
              {background颜色: colors.secondaryAccent},
            ]}>
            <View
              style={[
                gs.size32,
                gs.roundedFull,
                gs.center,
                {background颜色: selected颜色 ?? colors.accentGreen},
              ]}
            />
            <View style={gs.flex1}>
              <PrimaryText size={11} color={colors.secondaryText}>颜色</PrimaryText>
              <PrimaryText size={13} weight="medium">
                {selected颜色 ? '更换' : '选择'}
              </PrimaryText>
            </View>
          </TouchableOpacity>
        </View>

        {filteredCategories.length !== 0 && isAddButton ? (
          <>
            <View style={[gs.rowCenter, gs.gap8, gs.mb8]}>
              <View style={[gs.flex1, {height: 0.5, background颜色: colors.secondaryAccent}]} />
              <PrimaryText size={11} color={colors.secondaryText}>或从默认中选择</PrimaryText>
              <View style={[gs.flex1, {height: 0.5, background颜色: colors.secondaryAccent}]} />
            </View>
            <View style={[gs.minH55, gs.mt5]}>
              <FlashList
                data={filteredCategories}
                renderItem={renderDefaultCategoryItem}
                keyExtractor={item => item.name}
                scrollEnabled={false}
                horizontal
              />
            </View>
          </>
        ) : null}
      </View>

      <PrimaryButton
        onPress={handleAddFromDefaultOrAddCategory}
        colors={colors}
        buttonTitle={isAddButton ? 'Add' : 'Update'}
        disabled={!isValid && selectedCategories.length === 0}
      />
    </PrimaryView>
  );
};

export default memo(CategoryEntry);
