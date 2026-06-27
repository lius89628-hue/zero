import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import PrimaryButton from '../../components/atoms/PrimaryButton';
import usePersonalize from './usePersonalize';
import PrimaryView from '../../components/atoms/PrimaryView';
import PrimaryText from '../../components/atoms/PrimaryText';
import CustomInput from '../../components/atoms/CustomInput';
import {gs} from '../../styles/globalStyles';

const PersonalizeScreen = () => {
  const {colors, setName, name, handleSubmit, handle跳过, nameSchema} = usePersonalize();
  const isValid = nameSchema.safeParse(name).success;

  return (
    <PrimaryView colors={colors} style={gs.justifyBetween} dismissKeyboardOnTouch>
      <View>
        <TouchableOpacity style={[gs.selfEnd, gs.pt5p]} onPress={handle跳过}>
          <PrimaryText size={13} weight="medium" color={colors.secondaryText}>跳过</PrimaryText>
        </TouchableOpacity>

        <View style={gs.pt15p}>
          <PrimaryText size={28} weight="bold">我们应该怎么</PrimaryText>
          <PrimaryText size={28} weight="bold">称呼你？</PrimaryText>
        </View>

        <PrimaryText size={14} color={colors.secondaryText} style={gs.mt6}>
          这有助于个性化你的体验
        </PrimaryText>

        <View style={gs.mt30}>
          <CustomInput
            input={name}
            label={'你的名字'}
            colors={colors}
            placeholder={'例如：小明'}
            setInput={setName}
            schema={nameSchema}
          />
        </View>
      </View>
      <PrimaryButton onPress={handleSubmit} colors={colors} buttonTitle={'继续'} disabled={!isValid} />
    </PrimaryView>
  );
};

export default PersonalizeScreen;
