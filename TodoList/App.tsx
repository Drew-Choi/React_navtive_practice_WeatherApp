import { theme } from "./color";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [todos, setTodos] = useState<TodosType>({});

  // hadler
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const textHandler = (event: string) => setText(event);
  const saveToDos = useCallback(async (saveToDoObj: TodosType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saveToDoObj));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // onPress
  const toDoDelete = async (key: string) => {
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
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    await saveToDos(newTodos);
    setText("");
  };

  // useEffect
  useEffect(() => {
    const loadToDos = async () => {
      try {
        const loadData: string | null = await AsyncStorage.getItem(STORAGE_KEY);

        if (loadData !== null) return setTodos(JSON.parse(loadData));
      } catch (err) {
        console.error(err);
      }
    };
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
        onSubmitEditing={addTodo}
        onChangeText={textHandler}
        value={text}
        returnKeyType="done"
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].working === working ? (
            <View style={styles.todo} key={key}>
              <Text style={styles.todoText}>{todos[key].text}</Text>
              <TouchableHighlight onPress={() => toDoDelete(key)}>
                <Entypo name="trash" size={20} color={theme.grey} />
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
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoText: { color: "white", fontSize: 16, fontWeight: "500" },
});
