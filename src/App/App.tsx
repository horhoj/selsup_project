import { useEffect, useRef, useState } from 'react';

// ДЛЯ РАСШИРЕНИЯ МОДЕЛИ НУЖНО РАСКОМЕНТИРОВАТЬ ВСЕ КОММЕНТАРИИ С ПРЕФИКСОМ "РАСШИРИТЬ"

type ParamType = { type: 'string'; value: string };

// РАСШИРИТЬ: для добавления числового параметра
// type ParamType = { type: 'string'; value: string } | { type: 'number'; value: number };

interface Param {
  id: number;
  name: string;
  type: ParamType['type'];
}

interface ParamValue {
  paramId: number;
  value: ParamType['value'];
}

interface Model {
  paramValues: ParamValue[];
}

interface Props {
  params: Param[];
  model: Model;
}

// Глубокая копия модели
const makeModelCopy = (model: Model): Model => ({
  paramValues: model.paramValues.map((paramValue) => ({ ...paramValue })),
});

type ParamEditorValueFormProps<T extends ParamType['type']> = {
  value: Extract<ParamType, { type: T }>['value'];
  setValue: (value: Extract<ParamType, { type: T }>['value']) => void;
};

// форма для строкового параметра
const ParamEditorStringValueForm = ({ setValue, value }: ParamEditorValueFormProps<'string'>) => {
  return <input type={'text'} value={value} onChange={(e) => setValue(e.target.value)} />;
};

// РАСШИРЕНИЕ: Добавляем форму для числа
// const ParamEditorNumberValueForm = ({ setValue, value }: ParamEditorValueFormProps<'number'>) => {
//   return <input type={'number'} value={value} onChange={(e) => setValue(+e.target.value)} />;
// };

type ParamEditorFormValueFormDictionary = {
  [K in ParamType['type']]: ({ setValue, value }: ParamEditorValueFormProps<K>) => JSX.Element;
} & unknown;

const paramEditorFormValueFormDictionary: ParamEditorFormValueFormDictionary = {
  string: ParamEditorStringValueForm,
  // РАСШИРЕНИЕ: Добавляем форму для числа в словарь
  // number: ParamEditorNumberValueForm,
};

const ParamEditor = ({ model, params }: Props) => {
  const editorModel = useRef<Model>(makeModelCopy(model));
  const [_, setRerenderCounter] = useState(0);

  const rerender = () => {
    setRerenderCounter((prev) => (prev === 0 ? 1 : 0));
  };

  useEffect(() => {
    // на случай если модель будет изменена извне компонента ParamEditor
    editorModel.current = makeModelCopy(model);
    rerender();
  }, [model]);

  const handleValue = (value: ParamType['value'], paramId: ParamValue['paramId']) => {
    const idx = editorModel.current.paramValues.findIndex((paramValue) => paramValue.paramId === paramId);
    if (idx > -1) {
      editorModel.current.paramValues[idx].value = value;
      rerender();
    }
  };

  const getModel = () => {
    return editorModel.current;
  };

  const handleGetModel = () => {
    const data = JSON.stringify(editorModel.current, null, 2);
    console.log(data);
    alert(data);
  };

  return (
    <div>
      <button onClick={handleGetModel}>Получить модель</button>
      <ul>
        {params.map((param) => {
          const ParamForm = paramEditorFormValueFormDictionary[param.type] as (
            props: ParamEditorValueFormProps<ParamType['type']>,
          ) => JSX.Element;
          const value = editorModel.current.paramValues.find((paramValue) => paramValue.paramId === param.id)?.value;

          return (
            <li key={param.id}>
              {param.name}:{' '}
              {value !== undefined ? (
                <ParamForm value={value} setValue={(value) => handleValue(value, param.id)} />
              ) : (
                'не найдено значение параметра в модели!!!'
              )}
            </li>
          );
        })}
      </ul>
      <div>Содержимое модели</div>
      <pre>{JSON.stringify(getModel(), null, 2)}</pre>
    </div>
  );
};

const DEFAULT_PARAMS = [
  { id: 1, name: 'Параметр 1', type: 'string' },
  { id: 2, name: 'Параметр 2', type: 'string' },
  // РАСШИРЕНИЕ: добавляем параметр с типом число
  // { id: 3, name: 'Параметр 3', type: 'number' },
] as const satisfies Param[];

type DefaultParamsTuple = typeof DEFAULT_PARAMS;

type DefaultParamValues<T extends DefaultParamsTuple = DefaultParamsTuple> = {
  [K in keyof T]: T[K] extends { id: infer ID, type: infer TN }
    ? {
      paramId: ID,
      value: Extract<ParamType, { type: TN }>['value']
    }
    : T[K];
};

const DEFAULT_MODEL: Model = {
  paramValues: [
    { paramId: 1, value: '1-1' },
    { paramId: 2, value: '2-2' },
    //  РАСШИРЕНИЕ: Добавляем значение для параметра с типом число
    // { paramId: 3, value: 0 },
  ] satisfies DefaultParamValues,
};

export function App() {
  return <ParamEditor model={DEFAULT_MODEL} params={DEFAULT_PARAMS} />;
}
