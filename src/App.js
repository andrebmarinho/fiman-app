import { Route, Routes } from 'react-router-dom';

import NavBar from './components/nav-bar.js';
import Dashboard from './components/dashboard.js';
import CategoryCrud from './components/category-crud.js';
import AccountCrud from './components/account-crud.js';
import CardCrud from './components/card-crud.js';
import TransactionCrud from './components/transaction-crud.js';

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route exact path='/' element={<Dashboard />} />
                <Route path='/categories' element={<CategoryCrud />} />
                <Route path='/bank-accounts' element={<AccountCrud />} />
                <Route path='/credit-cards' element={<CardCrud />} />
                <Route path='/transactions' element={<TransactionCrud />} />
            </Routes>
        </>
    );
}

export default App;
