import asyncio
import websockets
import json
import time
import statistics

# Configurações do Teste de Carga
BASE_WS_URL = "ws://localhost:8000/ws/"
NUM_MEETINGS = 20       # Número de salas simultâneas
USERS_PER_MEETING = 5   # Usuários por sala
TOTAL_USERS = NUM_MEETINGS * USERS_PER_MEETING

async def participant_task(meeting_id, user_id, latencies):
    """Simula um participante em uma reunião."""
    uri = f"{BASE_WS_URL}{meeting_id}"
    try:
        async with websockets.connect(uri) as websocket:
            # O primeiro usuário de cada sala inicia o cronómetro
            if user_id == 0:
                await asyncio.sleep(1) # Espera todos conectarem
                start_msg = {
                    "action": "start",
                    "timestamp": time.time(),
                    "payload": {"phase": "Fase 1", "time_elapsed": 0}
                }
                await websocket.send(json.dumps(start_msg))
            
            # Todos os usuários medem o tempo de recepção
            while True:
                response = await websocket.recv()
                received_at = time.time()
                data = json.loads(response)
                
                if data.get("action") == "start":
                    sent_at = data.get("timestamp")
                    latency = (received_at - sent_at) * 1000 # em ms
                    latencies.append(latency)
                    break
    except Exception as e:
        print(f"Erro no Usuário {user_id} da Sala {meeting_id}: {e}")

async def run_load_test():
    print(f"🚀 Iniciando Teste de Carga: {NUM_MEETINGS} salas, {TOTAL_USERS} conexões totais...\n")
    latencies = []
    tasks = []

    for m in range(NUM_MEETINGS):
        meeting_id = f"load-test-meeting-{m}"
        for u in range(USERS_PER_MEETING):
            tasks.append(participant_task(meeting_id, u, latencies))

    start_time = time.time()
    await asyncio.gather(*tasks)
    end_time = time.time()

    if latencies:
        avg_lat = statistics.mean(latencies)
        p95_lat = statistics.quantiles(latencies, n=20)[18] # P95 aproximado
        print(f"\n📊 Resultados do Teste de Carga:")
        print(f"  - Tempo Total de Execução: {end_time - start_time:.2f}s")
        print(f"  - Latência Média de Broadcast: {avg_lat:.2f}ms")
        print(f"  - Latência P95: {p95_lat:.2f}ms")
        print(f"  - Sucesso: {len(latencies)}/{TOTAL_USERS} mensagens recebidas.")
        
        if avg_lat < 200:
            print("\n🏆 Performance EXCELENTE para sincronização global!")
        else:
            print("\n⚠️ Alerta: Latência acima de 200ms pode causar desvios visuais no cronómetro.")
    else:
        print("\n❌ Nenhuma mensagem capturada. Verifique se o servidor está online.")

if __name__ == "__main__":
    asyncio.run(run_load_test())
