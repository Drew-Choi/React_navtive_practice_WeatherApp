import { theme } from "./color";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STATUS_KEY, STORAGE_KEY } from "./constant";
import Checkbox from "expo-checkbox";

export default function App() {
  const [working, setWorking] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [todos, setTodos] = useState<TodosType>({});

  // hadler
  // 메뉴 카테고리 핸들러
  const travel = useCallback(async () => {
    await AsyncStorage.setItem(STATUS_KEY, "false");
    setWorking(false);
  }, []);

  const work = useCallback(async () => {
    await AsyncStorage.setItem(STATUS_KEY, "true");
    setWorking(true);
  }, []);

  // Async스토리지에 추가
  const saveToDos = useCallback(async (saveToDoObj: TodosType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saveToDoObj));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // todo리스트 삭제 핸들러
  const toDoDelete = useCallback(
    async (key: string) => {
      Alert.alert("리스트 삭제", "정말 삭제하시겠습니까?", [
        {
          text: "Cancel",
          onPress: () => {
            return;
          },
          style: "destructive",
        },
        {
          text: "Sure",
          onPress: () => {
            const newTodos = { ...todos };
            delete newTodos[key];
            setTodos(newTodos);
            saveToDos(newTodos);
          },
        },
      ]);
    },
    [todos]
  );

  // todo리스트 추가 핸들러
  const addTodo = async () => {
    if (text === "") {
    } else {
      const newTodos = {
        ...todos,
        [Date.now()]: { text, working, complete: false, edit: false },
      };
      await saveToDos(newTodos);
      setTodos(newTodos);
      setText("");
    }
  };

  // 수정본 저장
  const editTodo = useCallback(
    async (key: string) => {
      const newTodo = { ...todos, [key]: { ...todos[key], edit: false } };
      await saveToDos(newTodo);
      setTodos(newTodo);
    },
    [todos]
  );

  // useEffect
  useEffect(() => {
    // AsyncStorage 체크
    const setStatus = async () => {
      try {
        const statusCheck = await AsyncStorage.getItem(STATUS_KEY);
        if (statusCheck === null)
          return await AsyncStorage.setItem(STATUS_KEY, "true");
        // null이 아니라면
        setWorking(JSON.parse(statusCheck));
      } catch (err) {
        console.error(err);
      }
    };

    const loadToDos = async () => {
      try {
        const loadData: string | null = await AsyncStorage.getItem(STORAGE_KEY);

        if (loadData !== null) return setTodos(JSON.parse(loadData));
      } catch (err) {
        console.error(err);
      }
    };

    setStatus();
    loadToDos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableHighlight onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableHighlight>
      </View>
      <TextInput
        autoCorrect={false}
        onSubmitEditing={addTodo}
        onChangeText={(event) => setText(event)}
        value={text}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].working === working ? (
            <View style={styles.todo} key={key}>
              <TextInput
                onSubmitEditing={() => editTodo(key)}
                returnKeyType="done"
                style={{
                  ...styles.todoText,
                  textDecorationLine:
                    todos[key].complete && !todos[key].edit
                      ? "line-through"
                      : "none",
                  color:
                    todos[key].complete && !todos[key].edit
                      ? theme.light_grey
                      : "white",
                }}
                value={todos[key].text}
                onChangeText={(evnet) => {
                  setTodos((cur) => {
                    return { ...cur, [key]: { ...cur[key], text: evnet } };
                  });
                }}
                editable={!todos[key].edit ? false : true}
                // multiline={true}
              />
              <Checkbox
                style={styles.checkBox}
                color={theme.light_grey}
                value={todos[key].complete}
                onValueChange={() => {
                  if (!todos[key].edit) {
                    setTodos((cur: TodosType): TodosType => {
                      return {
                        ...cur,
                        [key]: { ...cur[key], complete: !cur[key].complete },
                      };
                    });
                  }
                }}
              />
              <TouchableHighlight
                onPress={() => {
                  if (!todos[key].complete) {
                    setTodos((cur) => {
                      return {
                        ...cur,
                        [key]: { ...cur[key], edit: true },
                      };
                    });
                  }
                }}
              >
                <Feather
                  style={styles.editIcon}
                  name="refresh-cw"
                  size={20}
                  color={!todos[key].edit ? theme.grey : "red"}
                />
              </TouchableHighlight>
              <TouchableHighlight onPress={() => toDoDelete(key)}>
                <Entypo
                  style={styles.trashIcon}
                  name="trash"
                  size={20}
                  color={theme.grey}
                />
              </TouchableHighlight>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  todo: {
    flex: 1,
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  todoText: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    paddingRight: 10,
    textDecorationLine: "none",
  },
  checkBox: { width: 15, height: 15 },
  editIcon: { marginHorizontal: 20 },
  trashIcon: {},
});
