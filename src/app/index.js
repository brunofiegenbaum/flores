import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("flores.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS flores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL,
    nome_cientifico TEXT NOT NULL
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM flores ORDER BY id DESC");
}

function adicionar(nome, cor, nomeCientifico) {
  db.runSync(
    "INSERT INTO flores (nome, cor, nome_cientifico) VALUES (?, ?, ?)",
    [nome, cor, nomeCientifico]
  );
}

function excluir(id) {
  db.runSync("DELETE FROM flores WHERE id = ?", [id]);
}

function atualizar(id, nome, cor, nomeCientifico) {
  db.runSync(
    "UPDATE flores SET nome = ?, cor = ?, nome_cientifico = ? WHERE id = ?",
    [nome, cor, nomeCientifico, id]
  );
}

export default function Flores() {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("");
  const [nomeCientifico, setNomeCientifico] = useState("");
  const [lista, setLista] = useState([]);
  const [idEditando, setIdEditando] = useState(null);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setNome("");
    setCor("");
    setNomeCientifico("");
    setIdEditando(null);
  }

  function salvar() {
    if (
      nome.trim() === "" ||
      cor.trim() === "" ||
      nomeCientifico.trim() === ""
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (idEditando !== null) {
      atualizar(idEditando, nome.trim(), cor.trim(), nomeCientifico.trim());
    } else {
      adicionar(nome.trim(), cor.trim(), nomeCientifico.trim());
    }

    limpar();
    carregar();
  }

  function editar(item) {
    setIdEditando(item.id);
    setNome(item.nome);
    setCor(item.cor);
    setNomeCientifico(item.nome_cientifico);
  }

  function remover(id) {
    Alert.alert("Excluir flor", "Deseja excluir esta flor?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          excluir(id);
          if (idEditando === id) {
            limpar();
          }
          carregar();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.tela} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Cadastro de Flores" }} />

      <Text style={styles.titulo}>Cadastro de Flores</Text>
      <Text style={styles.subtitulo}>
        Nome, cor predominante e nome científico salvos no SQLite
      </Text>

      <TextInput
        style={styles.campo}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome da flor"
      />

      <TextInput
        style={styles.campo}
        value={cor}
        onChangeText={setCor}
        placeholder="Cor predominante"
      />

      <TextInput
        style={styles.campo}
        value={nomeCientifico}
        onChangeText={setNomeCientifico}
        placeholder="Nome científico"
      />

      <Button
        title={idEditando !== null ? "Salvar alterações" : "Cadastrar"}
        onPress={salvar}
      />

      {idEditando !== null && (
        <View style={styles.cancelar}>
          <Button title="Cancelar edição" onPress={limpar} />
        </View>
      )}

      <FlatList
        style={styles.lista}
        keyboardShouldPersistTaps="handled"
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.dadosItem}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemDetalhe}>Cor: {item.cor}</Text>
              <Text style={styles.itemDetalhe}>
                Nome científico: {item.nome_cientifico}
              </Text>
            </View>

            <View style={styles.botoes}>
              <Button title="Editar" onPress={() => editar(item)} />
              <Button title="Excluir" onPress={() => remover(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma flor cadastrada.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 16,
  },
  campo: {
    borderWidth: 1,
    borderColor: "#D9DDE3",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  cancelar: {
    marginTop: 8,
  },
  lista: {
    flex: 1,
    marginTop: 16,
  },
  item: {
    backgroundColor: "#F1F3F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dadosItem: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  itemDetalhe: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  botoes: {
    gap: 8,
  },
  vazio: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
});
