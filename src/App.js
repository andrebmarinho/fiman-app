import { Route, Routes } from 'react-router-dom';

import NavBar from './components/nav-bar.js';
import Dashboard from './components/dashboard.js';
import CategoryCrud from './components/category-crud.js';
import BankAccountCrud from './components/bank-account-crud.js';
import CreditCardCrud from './components/credit-card-crud.js';
import TransactionCrud from './components/transaction-crud.js';

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route exact path='/' element={<Dashboard />} />
                <Route path='/categories' element={<CategoryCrud />} />
                <Route path='/bank-accounts' element={<BankAccountCrud />} />
                <Route path='/credit-cards' element={<CreditCardCrud />} />
                <Route path='/transactions/:type/:id' element={<TransactionCrud />} />
            </Routes>
        </>
    );
}

export default App;
