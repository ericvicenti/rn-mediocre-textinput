import Delta from "quill-delta";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type CustomAttributes = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
};

type Selection = {
  start: number;
  end: number;
};

function useAttributeCallback(
  delta: Delta,
  onDelta: (d: Delta) => void,
  selection: Selection,
  attribute: keyof CustomAttributes
) {
  return useCallback(() => {
    const prevFirstCharDelta = delta.slice(
      selection.start,
      selection.start + 1
    );
    const prevFirstCharOp = prevFirstCharDelta.ops[0];
    const wasApplied = !!prevFirstCharOp?.attributes?.[attribute];
    const newDelta = new Delta()
      .retain(selection.start)
      .retain(selection.end - selection.start, { [attribute]: !wasApplied });
    onDelta(delta.compose(newDelta));
  }, [delta, onDelta, selection, attribute]);
}

function MediocreText({
  delta,
  onDelta,
}: {
  delta: Delta;
  onDelta: (d: Delta) => void;
}) {
  const [selection, setSelection] = useState<null | Selection>(null);
  return (
    <SafeAreaView style={styles.safeArea}>
      <TextInput
        style={styles.textInput}
        multiline
        onSelectionChange={(e) => {
          setSelection(e.nativeEvent.selection);
        }}
        onBlur={() => {
          setSelection(null);
        }}
        // selection={{ ...selection }}
        onTextInput={(e) => {
          const { text, range } = e.nativeEvent;
          const newDelta = new Delta()
            .retain(range.start)
            .delete(range.end - range.start)
            .insert(text);
          onDelta(delta.compose(newDelta));
        }}
      >
        {delta.map((op, index) => {
          if (typeof op.insert === "string") {
            const { bold, italic, strikethrough, underline } =
              op.attributes || {};
            return (
              <Text
                key={index}
                style={{
                  fontWeight: bold ? "bold" : "normal",
                  fontStyle: italic ? "italic" : "normal",
                  textDecorationLine: underline
                    ? strikethrough
                      ? "underline line-through"
                      : "underline"
                    : strikethrough
                    ? "line-through"
                    : "none",
                }}
              >
                {op.insert}
              </Text>
            );
          } else {
            return null;
          }
        })}
        <Text />
      </TextInput>
      <View style={styles.toolbar}>
        <Button
          title="Bold"
          onPress={useAttributeCallback(delta, onDelta, selection, "bold")}
        />
        <Button
          title="Italic"
          onPress={useAttributeCallback(delta, onDelta, selection, "italic")}
        />
        <Button
          title="Underline"
          onPress={useAttributeCallback(delta, onDelta, selection, "underline")}
        />
        <Button
          title="Strikethrough"
          onPress={useAttributeCallback(
            delta,
            onDelta,
            selection,
            "strikethrough"
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [inputState, setInputState] = useState(
    new Delta([
      { insert: "Delta " },
      { insert: "is awesome", attributes: { bold: true } },
    ])
  );
  const [HACKY_REGRET_REMOUNT, REGRET_ME] = useState(0);
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text>Try the text input:</Text>
        {/* <Button
          onPress={() => {
            REGRET_ME((a) => a + 1);
          }}
          title="FIX ME"
        /> */}
        <MediocreText
          key={HACKY_REGRET_REMOUNT}
          delta={inputState}
          onDelta={(delta) => {
            console.log(delta);
            setInputState(delta);
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
  safeArea: {
    alignSelf: "stretch",
  },
  toolbar: {
    borderWidth: 1,
    borderTopWidth: 0,
    minHeight: 30,
    backgroundColor: "#eee",
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderColor: "#ccc",
    flexDirection: "row",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    minHeight: 120,
  },
});
