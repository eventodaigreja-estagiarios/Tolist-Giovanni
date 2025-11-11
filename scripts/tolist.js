const DataAPI = 'https://gsqorbummwauzdfqicdp.supabase.co';
const Apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcW9yYnVtbXdhdXpkZnFpY2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzA2MzcsImV4cCI6MjA3ODAwNjYzN30.ECOQjNW6ueu1bsJq6_5UlRrxra3KHehMSZ2kpnCJzgE';
const supabase = window.supabase.createClient(DataAPI, Apikey);

function logoutUser() {
  localStorage.removeItem("userEmail");
  window.location.href = "login.html";
}

const salvarBtn = document.getElementById("salvarTarefa");
const tarefasContainer = document.querySelector(".container");
const userData = JSON.parse(localStorage.getItem("userData"));
let tarefaEditandoId = null;
let todasTarefas = [];

function truncateText(message, limit) {
  return message.length > limit ? `${message.slice(0, limit)}...` : message;
}

function renderTarefa(tarefa) {
  const linha = `
    <div class="row text-center bg-light rounded-3 mt-2 p-2 align-items-center shadow-sm">
      <div class="col">${truncateText(tarefa.nome, 12)}</div>
      <div class="col">${truncateText(tarefa.titulo, 12)}</div>
      <div class="col">${truncateText(tarefa.descricao, 12)}</div>
      <div class="col">
        <span class="badge status-badge ${tarefa.status.toLowerCase() === "concluída"
      ? "status-concluida"
      : "status-pendente"
    }">${tarefa.status}</span>
      </div>
      <div id="${tarefa.id}" class="col">
        <button type="button" class="btn btn-primary editar" 
          data-bs-target="#modalTarefa" data-bs-toggle="modal"
          onClick="editItem(${tarefa.id})" id="editarBtn"
          style="width: 70px; padding: 8px;">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button type="button" class="btn btn-danger excluir" 
          id="excluirBtn" style="width: 70px; padding: 8px;"
          onClick="deleteItem(${tarefa.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
  tarefasContainer.insertAdjacentHTML("beforeend", linha);
}

async function carregarTarefas() {
  const { data, error } = await supabase
    .from("tarefas")
    .select("*")
    .eq("user_id", userData.id);

  if (error) {
    console.error("Erro ao carregar tarefas:", error.message);
    return;
  }

  todasTarefas = data;
  renderizarLista(todasTarefas);
}

function renderizarLista(lista) {
  document.querySelectorAll(".row.text-center.bg-light").forEach((el) => el.remove());
  lista.forEach((tarefa) => renderTarefa(tarefa));
}

const pesquisaInput = document.getElementById("pesquisaInput");
pesquisaInput.addEventListener("input", () => {
  const termo = pesquisaInput.value.toLowerCase().trim();
  const filtradas = todasTarefas.filter(
    (tarefa) =>
      tarefa.descricao.toLowerCase().includes(termo) ||
      tarefa.titulo.toLowerCase().includes(termo) ||
      tarefa.nome.toLowerCase().includes(termo) ||
      tarefa.status.toLowerCase().includes(termo)
  );
  renderizarLista(filtradas);
});

document.addEventListener("DOMContentLoaded", carregarTarefas);

salvarBtn.addEventListener("click", async () => {
  const nome = document.querySelector('.input-nome').value.trim();
  const titulo = document.querySelector('.input-titulo').value.trim();
  const descricao = document.querySelector('.input-descricao').value.trim();
  const status = document.querySelector('.input-status').value.trim();
  const userId = userData.id;

  if (!nome || !titulo || !descricao || !status) {
    alert("Preencha todos os campos!");
    return;
  }

  if (tarefaEditandoId) {
    const { data, error } = await supabase
      .from("tarefas")
      .update({ nome, titulo, descricao, status })
      .eq("id", tarefaEditandoId)
      .select();

    if (error) {
      console.error("Erro ao atualizar:", error.message);
      alert("Erro ao atualizar tarefa!");
      return;
    }

    alert("Tarefa atualizada com sucesso!");
    tarefaEditandoId = null;
    location.reload();
  } else {
    const { data, error } = await supabase
      .from("tarefas")
      .insert([{ nome, titulo, descricao, status, user_id: userId }])
      .select();

    if (error) {
      console.error("Erro ao salvar:", error.message);
      alert("Erro ao salvar no banco!");
      return;
    }

    renderTarefa(data[0]);
    alert("Tarefa adicionada com sucesso!");
  }

  document.querySelectorAll("#modalTarefa input, #modalTarefa select").forEach(input => input.value = "");
  const modalElement = document.getElementById("modalTarefa");
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.hide();

  const listaTarefas = document.querySelectorAll(".row.text-center.bg-light");
  listaTarefas.forEach(t => t.remove());
  await carregarTarefas();
});

async function editItem(itemId) {
  console.log(itemId);
  tarefaEditandoId = itemId;

  const { data, error } = await supabase.from("tarefas").select("*").eq('id', itemId);

  if (error) {
    console.log("Erro ao buscar tarefa", error.message);
    return;
  }

  const nome = document.querySelector('.input-nome');
  const titulo = document.querySelector('.input-titulo');
  const descricao = document.querySelector('.input-descricao');
  const status = document.querySelector('.input-status');

  nome.value = data[0].nome;
  titulo.value = data[0].titulo;
  descricao.value = data[0].descricao;
  status.value = data[0].status;
}

async function deleteItem(itemId) {
  const confirmar = confirm("Tem certeza que deseja excluir esta tarefa?");
  if (!confirmar) return;

  const { error } = await supabase.from("tarefas").delete().eq("id", itemId);

  if (error) {
    console.error("Erro ao excluir no banco:", error.message);
    alert("Erro ao excluir tarefa!");
    return;
  }

  const tarefaEi = document.getElementById(itemId)?.closest(".row");
  if (tarefaEi) tarefaEi.remove();
  alert("Tarefa excluída com sucesso!");
}

document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData) {
    const perfilNome = document.getElementById("perfilNome");
    const perfilIcon = document.getElementById("perfilIcon");
    const email = userData.email || "usuario@exemplo.com";
    const primeiraLetra = email[0].toUpperCase();
    perfilIcon.textContent = primeiraLetra;
  }
});

const voltar = document.getElementById("voltar");
if (voltar) {
  voltar.addEventListener("click", () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalTarefa"));
    if (modal) modal.hide();

    document.querySelectorAll("#modalTarefa input, #modalTarefa select").forEach(input => {
      input.value = "";
    });

    window.location.href = "tolist.html";
  });
}
