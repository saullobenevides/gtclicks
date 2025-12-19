import 'dotenv/config';

async function verifyToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!token) {
    console.error('❌ Erro: MERCADOPAGO_ACCESS_TOKEN não encontrado no .env');
    process.exit(1);
  }

  console.log('🔑 Token encontrado:', token.substring(0, 5) + '...' + token.substring(token.length - 4));
  console.log('📡 Testando conexão com Mercado Pago...');

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [{ 
            title: 'Verificação de Token GTClicks', 
            quantity: 1, 
            currency_id: 'BRL', 
            unit_price: 1.0 
        }],
        back_urls: { 
            success: 'http://localhost:3000/teste-sucesso' 
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso! O Token é válido.');
      console.log('🔗 Link de teste gerado:', data.init_point);
      console.log('🆔 ID da Preferência:', data.id);
    } else {
      const error = await response.text();
      console.error('❌ Falha na conexão com Mercado Pago:');
      console.error(error);
    }
  } catch (err) {
    console.error('❌ Erro de execução:', err.message);
  }
}

verifyToken();
