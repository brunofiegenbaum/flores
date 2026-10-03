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

const db = SQLite.openDatabaseSync("vectras.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS vectras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo TEXT NOT NULL,
    cor TEXT NOT NULL,
    ano NUMBER NOT NULL
  );
`);

function listar() {
  return db.getAllSync("SELECT * FROM vectras ORDER BY id DESC");
}

function adicionar(modelo, cor, ano) {
  db.runSync(
    "INSERT INTO vectras (modelo, cor, ano) VALUES (?, ?, ?)",
    [modelo, cor, ano]
  );
}

function excluir(id) {
  db.runSync("DELETE FROM vectras WHERE id = ?", [id]);
}

function atualizar(id, modelo, cor, ano) {
  db.runSync(
    "UPDATE vectras SET modelo = ?, cor = ?, ano = ? WHERE id = ?",
    [modelo, cor, ano, id]
  );
}

export default function vectras() {
  const [modelo, setModelo] = useState("");
  const [cor, setCor] = useState("");
  const [ano, setAno] = useState("");
  const [lista, setLista] = useState([]);
  const [idEditando, setIdEditando] = useState(null);

  function carregar() {
    setLista(listar());
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setModelo("");
    setCor("");
    setAno("");
    setIdEditando(null);
  }

  function salvar() {
    if (
      modelo.trim() === "" ||
      cor.trim() === "" ||
      ano.trim() === ""
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (idEditando !== null) {
      atualizar(idEditando, modelo.trim(), cor.trim(), ano.trim());
    } else {
      adicionar(modelo.trim(), cor.trim(), ano  .trim());
    }

    limpar();
    carregar();
  }

  function editar(item) {
    setIdEditando(item.id);
    setModelo(item.modelo);
    setCor(item.cor);
    setAno(item.ano);
  }

  function remover(id) {
    Alert.alert("Excluir vectra", "Deseja excluir este vectra?", [
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
      <Stack.Screen options={{ title: "Cadastro de Vectras" }} />

      <Text style={styles.titulo}>Cadastro de Vectras</Text>
      <Text style={styles.subtitulo}>
        Modelo, cor predominante e ano de fabricação salvos no SQLite
      </Text>

      <TextInput
        style={styles.campo}
        value={modelo}
        onChangeText={setModelo}
        placeholder="Modelo do Vectra" placeholderTextColor="grey"
      />

      <TextInput
        style={styles.campo}
        value={cor}
        onChangeText={setCor}
        placeholder="Cor predominante" placeholderTextColor="grey"
      />

      <TextInput
        style={styles.campo}
        value={ano}
        onChangeText={setAno}
        placeholder="Ano de fabricação" placeholderTextColor="grey"
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
              <Text style={styles.itemNome}>{item.modelo}</Text>
              <Text style={styles.itemDetalhe}>Cor: {item.cor}</Text>
              <Text style={styles.itemDetalhe}>
                Ano: {item.ano}
              </Text>   
            </View> 

            <View style={styles.botoes}>
              <Button title="Editar" onPress={() => editar(item)} />
              <Button title="Excluir" onPress={() => remover(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum vectra cadastrado.</Text>
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
    borderColor: "#0066ff",
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
