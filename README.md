# bitcoin transaction visualizer <br>
( SUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII )

> **part of my [bitcoin developer journey](https://github.com/Raskollnikov/bitcoin-developer-journey)**  
> project 4/20 | status: ✅ **complete**

[![live demo](https://img.shields.io/badge/live-demo-orange?style=for-the-badge&logo=bitcoin)](https://bitcoin-tx-visualizer-6me5.vercel.app/)
[![github](https://img.shields.io/badge/source-code-black?style=for-the-badge&logo=github)](https://github.com/Raskollnikov/bitcoin-tx-visualizer)

---

##  [try it live →](https://bitcoin-tx-visualizer-6me5.vercel.app/)

**paste any bitcoin transaction hash and see inputs, outputs, fees, and flow visually**

---

##  what is this

a **full-stack** bitcoin blockchain explorer that takes any transaction and makes the data **actually understandable**.

most block explorers are information overload, walls of hex and numbers. this one shows you:
- **where the money came from** (inputs)
- **where it went** (outputs)  
- **how much was paid in fees**
- **the visual flow** of bitcoin through the transaction

built because i wanted to truly understand the UTXO (unspent transaction output) model, not just read about it
i learned so much about real data inside block ( of bitcoin ) i was dealing that w Typescript types ( it was horrible ) 

---

##  features

### transaction explorer
- **paste any TX hash** -> instant visualization
- **inputs ↔ outputs flow diagram** -> see bitcoin moving visually
- **fee breakdown** -> total fee + sats/vbyte
- **confirmation status** -> confirmed with block height, or unconfirmed in mempool
- **coinbase detection** -> mining rewards shown differently
- **size/weight metrics** -> understand transaction cost factors
- **clickable addresses** -> click any input/output address to explore it ( +blocks it was minned in )

 
### Visualize OP_Return message 
i added new feature in order to see the attached messages in the transaction <br>
in my favorite transaction which exists in the block: 666,666 anonymous person created transaction with message: <br>
(Romans 12:21) "do not be overcome by evil, but overcome evil with good" <br>
i wanted to added the hover effect on the op_return message <br>
but in transaction we can only attach the messages in hex format ( which can be translated to string ) 
<img width="1559" height="769" alt="image" src="https://github.com/user-attachments/assets/730fdda6-81b5-46bd-ab11-f62bc3f13153" />

If we convert these characters to Text we will get: 

<img width="658" height="455" alt="image" src="https://github.com/user-attachments/assets/b4074a86-fadf-4308-8d16-2e8fe9738552" />


in my website i added that transaction 

<img width="1326" height="996" alt="image" src="https://github.com/user-attachments/assets/f7792b11-97eb-4289-9725-89d8cdbfe47e" />

now it's available to see it's message too ( Lets gooo!!! ) 

<img width="1264" height="832" alt="image" src="https://github.com/user-attachments/assets/5c998c44-9ceb-450d-871f-dc8da5fae62a" />

LINK: [romans 12:21](https://bitcoin-tx-visualizer-6me5.vercel.app/tx/057954bb28527ff9c7701c6fd2b7f770163718ded09745da56cc95e7606afe99)

### address explorer
- **balance** -> current confirmed + mempool balance
- **transaction history** -> all TXs involving this address ( it was huge data so i capped it at 50 tx )
- **total received/sent** -> lifetime statistics
- **recent activity** -> last 50 transactions with timestamps
<img width="1487" height="886" alt="image" src="https://github.com/user-attachments/assets/404b897a-1baa-4811-9b90-169ff7ac3a7a" />
<img width="1352" height="1033" alt="image" src="https://github.com/user-attachments/assets/818260c3-be8a-4a6c-8763-8c3651fe4ddd" />


### block explorer
- **block details** — height, timestamp, miner, size, weight
- **transaction list** — all TXs in the block with pagination
- **mining stats** — difficulty, nonce, merkle root
- **navigation** — explore previous blocks too ( i wanna add search on block too right now navigation only happens w params ) 

<img width="1427" height="950" alt="image" src="https://github.com/user-attachments/assets/14e91bd5-65d0-473d-ac05-6fb4a74fb71d" />
<img width="1427" height="950" alt="image" src="https://github.com/user-attachments/assets/7588adbc-caf0-445b-a9e4-e223a81c6744" />
<img width="840" height="942" alt="image" src="https://github.com/user-attachments/assets/2c0fc9a4-8dc2-40ae-8fcd-57c4dceec485" />


###  user experience
- **dark UI** optimized for readability
- **responsive design** -> works on mobile, tablet, desktop
- **error handling** -> clear messages when TX/address/block not found
- **example transactions** -> famous Bitcoin TXs to explore (pizza TX, genesis coinbase, my tx's etc...)

---

##  architecture (full stack)

```
┌──────────────────────────────────────────┐
│         FRONTEND (React + TS)            │
│  - Vite + TailwindCSS                    │
│  - TypeScript throughout                 │
│  - React Router for navigation           │
│  - Custom hooks for API calls            │
│  - Deployed on Vercel                    │
└─────────────┬────────────────────────────┘
              │
              │ HTTPS requests
              │
┌─────────────▼────────────────────────────┐
│       BACKEND (Node + Express)           │
│  - Express.js REST API                   │
│  - TypeScript with strict types          │
│  - In-memory caching layer               │
│  - Rate limiting middleware              │
│                                          │
└─────────────┬────────────────────────────┘
              │
              │ Fetches from
              │
┌─────────────▼────────────────────────────┐
│     MEMPOOL.SPACE API (public)           │
│  - Free, no authentication               │
│  - Real-time Bitcoin blockchain data     │
│                                          │
└──────────────────────────────────────────┘
```

---

##  tech stack

### frontend
- **react 18** - UI framework
- **typescript** - type safety throughout
- **vite** - blazing fast build tool
- **react router** - client-side routing for TX/address/block pages
- **tailwindcss** - styling
- **lucide-react** - icons

### backend
- **node.js + express** - REST API server
- **typescript** - fully typed backend
- **mempool.space API** - blockchain data source
- **express-rate-limit** - API rate limiting
- **cors** - cross-origin configuration
- **dotenv** - environment variables

### deployment
- **frontend:** vercel (auto-deploy from GitHub)
- **backend:** vercel (free tier)

---

## project structure

```
bitcoin-tx-visualizer/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── blockstream.ts    ← API handlers (tx, address, block)
│   │   ├── routes/
│   │   │   ├── tx.ts             ← GET /api/tx/:txid
│   │   │   ├── address.ts        ← GET /api/address/:addr
│   │   │   └── block.ts          ← GET /api/block/:block
│   │   ├── types/
│   │   │   └── blockchain.types.ts     ← TypeScript interfaces
│   │   ├── utils/
│   │   │   └── cache.ts          ← in-memory caching
│   │   ├── middleware/
│   │   │   └── cache.ts      ← rate limiting
│   │   └── index.ts              ← express app entry
│   ├── package.json
│   └── tsconfig.json
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── SearchBar.tsx           ← TX/address/block search
    │   │   ├── TxVisualizer.tsx        ← Main TX display component
    │   │   ├── TxFlowDiagram.tsx       ← Inputs -> Outputs visual
    │   │   ├── InputCard.tsx           ← Single input display
    │   │   ├── OutputCard.tsx          ← Single output display
    │   │   ├── TxDetails.tsx           ← Fee, size, confirmations
    │   │   ├── AddressPage.tsx         ← Address balance + history
    │   │   ├── BlockPage.tsx           ← Block details + TX list
    │   │   └── ExampleTxs.tsx          ← Famous TX quick links
    │   ├── hooks/
    │   │   ── useTx.ts                ← Fetche transaction
    │   ├── utils/
    │   │   ├── format.ts               ← Sats → BTC, timestamps
    │   ├── types/
    │   │   └── index.ts                ← Frontend TypeScript types
    │   ├── App.tsx                     ← Main app with routing
    │   └── main.tsx                    ← Entry point
```

---

##  how the visualizer works

### data flow: from hash to visual

```
1. user pastes TX hash
   ↓
2. frontend sends GET /api/tx/:txid to backend
   ↓
3. backend checks in-memory cache
   ↓ (cache miss)
4. backend fetches from mempool.space API
   ↓
5. backend transforms raw data:
   - separates coinbase inputs
   - calculates totals (input sum, output sum)
   - derives fee rate (sats/vbyte)
   - identifies change addresses
   ↓
6. backend caches result 
   ↓
7. backend sends transformed JSON to frontend
   ↓
8. frontend renders:
   - TxDetails (fee, size, status)
   - TxFlowDiagram (inputs → outputs with arrows)
   - clickable addresses
etc....

```

### the input/output flow diagram

this was the **hardest part** to build. here's what i learned:

**challenge 1: layout complexity**
- inputs on left, outputs on right
- variable number of each (1 input → 2 outputs, 3 inputs → 5 outputs, etc.)
- needed to align properly on mobile AND desktop


```

**challenge 2: coinbase transactions**
- mining rewards have no "previous output" (they create new BTC)
- needed special UI treatment

```

**challenge 3: showing the flow**
- needed visual connection between inputs and outputs
- arrows needed to be responsive

**solution:**
- single arrow in center column
- shows total fee below arrow
- color-coded: green for value, red for fees

**challenge 4: large transactions**
- some TXs have 100+ inputs or outputs
- displaying all would break the UI
  

---

### bug 1: massive API calls slowing everything down
**symptom:** every TX lookup took 2-3 seconds, even for same TX

**cause:** no caching — hitting mempool.space API on every request


### bug 2: TX inputs showing "undefined" addresses
**symptom:** some inputs displayed `undefined` instead of an address

**cause:** coinbase transactions don't have `prev_out` ( they create new BTC from thin air )

**debugging:**
```typescript
//  assumed all inputs have prev_out
const address = input.prev_out.addr; // -> undefined for coinbase

//  check if it exists first
const address = input.prev_out?.addr ?? null;
const isCoinbase = !input.prev_out;


**lesson:** coinbase TXs (block rewards) have fundamentally different structure, always check for edge cases in Bitcoin data.

---

### bug 3: mobile layout breaking on long addresses
**symptom:** bitcoin addresses overflowed containers on mobile, breaking entire layout

**cause:** addresses are long strings (26-62 characters) with no natural break points

```

**lesson:** always test with real data on small screens. bitcoin addresses are longer than typical strings.


---

### bug 4: backend crashed on invalid TX hash
**symptom:** entering random string crashed entire backend

**lesson:** never trust user input. validate everything before hitting external APIs or databases

---

## what i learned

### understanding the UTXO model
before this project, i knew the theory now i **understand**:
- transactions don't have "balances", they consume UTXOs (inputs) and create new UTXOs ( outputs )
- your "balance" is the sum of all UTXOs you can spend (with your private keys)
- fees are implicit: `fee = sum(inputs) - sum(outputs)` ( there are not separated output for fee ,which surpraised me a lot ) 
- change addresses are just outputs back to yourself 
- coinbase TXs create new BTC (they have no inputs, only outputs)

**the breakthrough moment:** seeing a TX with 1 BTC input -> 0.7 BTC output + 0.299 BTC change, the remaining 0.001 BTC is the fee. it clicked.

### full-stack development
**before:** i'd only built frontend projects  ( or beginner full stack apps ) 
**after:** i can now:
- design REST APIs with proper HTTP methods and status codes
- implement caching strategies (in-memory, time-based expiry)
- handle CORS properly
- deploy backend and frontend separately
- connect them with environment variables

**hardest part:** getting CORS right. spent 2 hours debugging 
`No 'Access-Control-Allow-Origin' header` errors before understanding I needed to specify exact origins, not wildcards.
bc of that i have added few new commits on app :)))

### API design patterns
learned to transform data for frontend consumption:
```typescript
//  Bad: send raw API response
return res.json(mempoolData);

//  Good: transform to what frontend needs
return res.json({
  txid: data.txid,
  confirmed: data.status.confirmed,
  inputs: data.vin.map((inp, i) => ({
    index: i,
    address: inp.prev_out?.addr ?? null,
    value: inp.prev_out?.value ?? 0,
  })),
});
```

**why:** 
- frontend doesn't need to handle edge cases
- backend does the heavy lifting ( validation, transformation etc,,,)
- single source of truth for business logic

### caching strategies
**what to cache:**
- confirmed TXs (never change) -> 60 min TTL
- blocks (immutable once confirmed) -> 60 min TTL
- addresses (balances change) -> 2 min TTL

**what NOT to cache:**
- mempool TXs (can be replaced or dropped)
- current mempool size (changes every second)


```

**impact:** reduced API calls by 95%, improved response times by 50x (2.5s -> 5ms for cached TXs)

### TypeScript in production
used TypeScript on bot h frontend and backend for the first time

**benefits i actually experienced:**
- caught 23 bugs at compile time (wouldve been runtime errors)
- refactoring was safe (rename a type -> all usages update)
- documentation is built-in (hover over function -> see types)

```


```
TxVisualizer
├── TxDetails (fee, size, status)
├── TxFlowDiagram
│   ├── InputCard (× N inputs)
│   ├── Arrow (with fee)
│   └── OutputCard (× M outputs)
└── ExampleTxs (famous TXs)
```

### responsive design for data-heavy UIs
visualizing transactions is HARD on mobile. learned:
- stack side-by-side layouts vertically on small screens
- truncate long txId's 
- prioritize most important info (fee, amount) over details (script type, witness data)


```

### bitcoin protocol deep dive
**things i now understand that i didn't before:**
- segwit vs legacy transactions (weight vs size)
- why fee rate is sats/vbyte not sats/byte (segwit discount)
- what a coinbase transaction is 
- how mining rewards work (coinbase TX is always first in block)
- transaction version numbers and what they mean
- locktime and sequence numbers (time-locked transactions)
- how UTXO model actually works

---

##  challenges overcome

### challenge 1: visualizing inputs → outputs
**problem:** how to show 3 inputs and 5 outputs in a way thats intuitive?

**failed attempts:**
1. table format ->> too boring, doesn't show flow
2. list format -> doesn't show relationship between inputs/outputs

```

---

### challenge 2: handling all TX types
**problem:** bitcoin has many transaction types with different structures

**types encountered:**
- standard transfer (inputs -> outputs)
- coinbase (mining reward, no inputs)
- consolidation (100 inputs -> 1 output)
- payment batch (1 input -> 500 outputs, like exchange withdrawals)

---

### challenge 3: performance with large TXs
**problem:** some transactions have 1000+ inputs/outputs (batched payments), rendering all would freeze browser

**solution:** 
i fixed input / outputs to 8 
<img width="806" height="373" alt="image" src="https://github.com/user-attachments/assets/14cc895d-fe5d-4ddc-bbbb-5d187c4e78a5" />

that's why i added another field to fully show the flow of inputs and outputs ( even hundreds of it ) 
<img width="1260" height="609" alt="image" src="https://github.com/user-attachments/assets/0b908491-b980-4c4d-8e22-87be952ae933" />


---

##  deployment

### backend (vercel)

```

### frontend (vercel)
```bash
# 1. vercel.com
- import from GitHub
- select repo/frontend directory
- set environment variable:
  VITE_API_URL=https://bitcoin-tx-api.railway.app
- deploy
- vercel gives you: bitcoin-tx-visualizer-6me5.vercel.app
```

---

## future improvements 

**v2 features i might add:**
- [ ] WebSocket live updates (no polling, instant confirmations)
- [ ] export TX as image/PDF for records
- [ ] multi-TX comparison (compare fees across transactions)
- [ ] address labels (detect exchanges, known entities)
- [ ] transaction graph (show chain of transactions)
- [ ] RBF (replace-by-fee) detection
- [ ] script interpreter (show what the script does in plain English)

---

## API endpoints

### `GET /api/tx/:txid`
fetch transaction details

**response:**
```json
type Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Vin[];
  vout: Vout[];
  size: number;
  weight: number;
  fee: number;
  totalInputValue?: number;
  totalOutputValue?: number;
  isCoinbase?: boolean;
}

```

### `GET /api/address/:address`
fetch address balance and transaction history

**response:**
```json
type Address {
  address: string;
  balance: number;
  total_received: number;
  total_sent: number;
  tx_count: number;
  mempool_balance: number;
  mempool_tx_count: number;
  recent_txs: Transaction[];
  next_after_txid: string | null;
  has_more: boolean;
}
```

### `GET /api/block/:hash`
fetch block details and transactions

**response:**
```json
type Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash?: string;
  nonce: number;
  bits: number;
  difficulty: number;
  txs: Transaction[];
  has_more?: boolean;
  next_start?: number | null;
  current_start?: number;
  total_tx_count?: number;
}
```

## tech learnings recap

**full-stack skills:**
- REST API design and implementation
- frontend <-> backend communication
- CORS configuration
- environment-based configuration

**bitcoin protocol:**
- UTXO model (finally clicked)
- transaction structure (inputs, outputs, fees)
- coinbase transactions (mining rewards)
- fee calculation and optimization

**TypeScript:**
- type-safe API responses
- catching bugs at compile time
- interface design

**react patterns:**
- component composition
- custom hooks for data fetching
- loading/error state management
- responsive design with Tailwind

**backend engineering:**
- caching strategies (TTL-based)
- rate limiting
- error handling and validation
- API response transformation

---

## acknowledgments

- mempool.space for their excellent free API
- the bitcoin developer community for documentation
---

## why i built this

**context:** project 4/20 in my journey to become a blockchain backend developer

**after building:**
1. bitcoin address generator (crypto fundamentals)
2. price tracker (APIs + real-time data)
3. satoshi converter (multi-currency, utilities)

**i needed to prove to myself i understand bitcoin at a protocol level ( begginner )**, not just surface-level stuff

---

**follow my journey:** [all 20 projects →](https://github.com/Raskollnikov/bitcoin-developer-journey)

---

** if this helped you understand bitcoin transactions, star the repo!**

---

**last updated:** february 28.2026  
**status:** production-ready 
**complexity:** full-stack 

SUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
