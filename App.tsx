import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type RichString = { key: string; t: string; bold?: boolean };
type TextContent = Array<RichString>;

let nodeKeyCountId = 0;
const timeId = Date.now();
function getNodeKey() {
  nodeKeyCountId += 1;
  return `${timeId}_${nodeKeyCountId}`;
}

function MediocreText({
  value,
  onValue,
}: {
  value: TextContent;
  onValue?: (value: TextContent) => void;
}) {
  const [selection, setSelection] = useState<null | {
    start: number;
    end: number;
  }>(null);
  return (
    <SafeAreaView
      style={{
        alignSelf: "stretch",
      }}
    >
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          paddingVertical: 12,
          borderRadius: 8,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          minHeight: 120,
        }}
        multiline
        onSelectionChange={(e) => {
          setSelection(e.nativeEvent.selection);
        }}
        onBlur={() => {
          setSelection(null);
        }}
        onTextInput={(e) => {
          const { previousText, text, range } = e.nativeEvent;
          console.log("Raw text event", {
            text,
            // previousText,
            start: range.start,
            end: range.end,
          });
          const newValue = [...value];
          if (newValue.length === 0) {
            onValue([{ t: text, key: getNodeKey() }]);
            return;
          }

          let editingNode: null | number = null;
          let editingTestIndex = 0;
          let editingTestChar = 0;

          while (editingNode === null) {
            const testNode = newValue[editingTestIndex];
            if (
              range.start >= editingTestChar &&
              range.end <= editingTestChar + testNode.t.length
            ) {
              editingNode = editingTestIndex;
            }
            editingTestIndex += 1;
            editingTestChar += testNode.t.length;
          }

          const node = newValue[editingNode];
          let newText = node.t;
          newText = `${node.t.slice(
            0,
            range.start - editingTestChar
          )}${text}${node.t.slice(range.end - editingTestChar)}`;
          newValue[editingNode] = {
            ...node,
            t: newText,
            key: getNodeKey(),
          };
          onValue(newValue);
        }}
      >
        {value.map((textContent) => {
          return (
            <Text
              key={textContent.key}
              style={{
                fontWeight: textContent.bold ? "bold" : "normal",
              }}
            >
              {textContent.t}
            </Text>
          );
        })}
      </TextInput>
      <View
        style={{
          borderWidth: 1,
          borderTopWidth: 0,
          minHeight: 30,
          backgroundColor: "#eee",
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
          borderColor: "#ccc",
        }}
      >
        <Button
          title="Bold"
          onPress={() => {
            const newValue = [...value];

            if (!selection || selection.start === selection.end) {
              alert("Empty selection not supported yet.");
              return;
            }
            if (newValue.length === 0) {
              alert("Empty value is not supported yet.");
              return;
            }

            let keysOfToggleNode: Array<string> = [];

            let selectionStartNode: null | number = null;
            let selectionStartTestIndex = 0;
            let selectionStartTestChar = 0;

            while (selectionStartNode === null) {
              const testNode = newValue[selectionStartTestIndex];
              if (
                selection.start >= selectionStartTestChar &&
                selection.end < selectionStartTestChar + testNode.t.length
              ) {
                selectionStartNode = selectionStartTestIndex;
              }
              selectionStartTestIndex += 1;
              selectionStartTestChar += testNode.t.length;
            }

            // prepare the newValue to have appropriate slicing
            // TODO!

            let considerationNodeIndex = 0;
            let considerationNode = newValue[considerationNodeIndex];

            let selectionOffset = 0;

            // identify keysOfToggleNode
            // for () {

            if (
              selectionOffset === selection.start &&
              considerationNode.t.length === selection.end
            ) {
              console.log("You have selected node: ", considerationNode.key);
              keysOfToggleNode.push(considerationNode.key);
            }

            // }

            // are we bolding or unbolding?
            const firstToggleNode = newValue.find(
              (n) => n.key === keysOfToggleNode[0]
            );
            let isBolding = !firstToggleNode.bold;

            // apply the new bold value to newValue[keysOfToggleNode]
            keysOfToggleNode.forEach((toggleNodeKey) => {
              const toggleValueIndex = newValue.findIndex(
                (n) => n.key === toggleNodeKey
              );
              newValue[toggleValueIndex] = {
                ...newValue[toggleValueIndex],
                bold: isBolding,
              };
            });

            console.log("doing bolding or unboldening, ", {
              selection,
              value,
            });

            onValue(newValue);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [inputState, setInputState] = useState<TextContent>([
    { key: "0", t: "Bold Text Editor. It's all or nothing, baby!" },
    // { key: "a", t: "Hello, wonderful world!" },
    // { key: "b", t: "this is bold text.", bold: true },
    // { key: "c", t: " this is normal text" },
  ]);

  const [HACKY_REGRET_KEY, setHackyRegretKey] = useState(0);
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text>Try the text input:</Text>
        {/* <Button
          title="REMOUNT"
          onPress={() => {
            setHackyRegretKey((k) => (k += 1));
          }}
        /> */}
        <MediocreText
          key={HACKY_REGRET_KEY}
          value={inputState}
          onValue={(value) => {
            console.log("VALUE: ", value);
            setInputState(value);
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
