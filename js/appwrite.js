/**
 * ═══════ SpendSense — Appwrite SDK Configuration ═══════
 * CDN v17.0.0 Web SDK uses POSITIONAL arguments.
 *
 * NOTE: No API key here — client SDK uses session cookies.
 */

/* ─── Appwrite Config ─── */
const APPWRITE_CONFIG = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '699afb85002645b83dfa',
    databaseId: 'spendsense',
    collections: {
        expenses: 'expenses',
        budgets: 'budgets',
    },
};

/* ─── Initialize Appwrite SDK ─── */
const client = new Appwrite.Client();
client
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

/* ─── Auth Module ─── */
const Auth = {
    _currentUser: null,

    async getUser() {
        if (this._currentUser) return this._currentUser;
        try {
            this._currentUser = await account.get();
            return this._currentUser;
        } catch (e) {
            this._currentUser = null;
            return null;
        }
    },

    async isLoggedIn() {
        return !!(await this.getUser());
    },

    async login(email, password) {
        await account.createEmailPasswordSession(email, password);
        this._currentUser = await account.get();
        return this._currentUser;
    },

    async register(email, password, name) {
        await account.create(Appwrite.ID.unique(), email, password, name);
        return await this.login(email, password);
    },

    async logout() {
        try {
            await account.deleteSession('current');
        } catch (e) {
            console.warn('Logout error:', e.message);
        }
        this._currentUser = null;
        window.location.href = getPagePath('login.html');
    },

    async requireAuth() {
        const user = await this.getUser();
        if (!user) {
            window.location.href = getPagePath('login.html');
            return null;
        }
        return user;
    },

    async updateName(name) {
        const result = await account.updateName(name);
        this._currentUser = result;
        return result;
    },

    async updatePassword(newPassword, oldPassword) {
        return await account.updatePassword(newPassword, oldPassword);
    },
};

/* ─── Expense Service ─── */
const ExpenseService = {
    async create(data) {
        const user = await Auth.getUser();
        if (!user) throw new Error('Not authenticated');
        return await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            Appwrite.ID.unique(),
            {
                userId: user.$id,
                description: data.description,
                amount: Math.round(data.amount * 100),
                category: data.category,
                date: data.date,
                notes: data.notes || '',
                type: data.type || 'expense',
            },
            [
                Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
                Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
                Appwrite.Permission.delete(Appwrite.Role.user(user.$id)),
            ]
        );
    },

    async list(extraQueries = []) {
        const user = await Auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const queries = [
            Appwrite.Query.equal('userId', user.$id),
            Appwrite.Query.orderDesc('date'),
            Appwrite.Query.limit(100),
            ...extraQueries,
        ];
        return await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            queries
        );
    },

    async get(documentId) {
        return await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            documentId
        );
    },

    async update(documentId, data) {
        return await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            documentId,
            data
        );
    },

    async delete(documentId) {
        return await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            documentId
        );
    },

    async getMonthlyTotal(month) {
        const user = await Auth.getUser();
        if (!user) return 0;
        const result = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            [
                Appwrite.Query.equal('userId', user.$id),
                Appwrite.Query.startsWith('date', month),
                Appwrite.Query.equal('type', 'expense'),
                Appwrite.Query.limit(500),
            ]
        );
        return result.documents.reduce((sum, doc) => sum + doc.amount, 0);
    },

    async getCategoryTotals(month) {
        const user = await Auth.getUser();
        if (!user) return {};
        const result = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.expenses,
            [
                Appwrite.Query.equal('userId', user.$id),
                Appwrite.Query.startsWith('date', month),
                Appwrite.Query.equal('type', 'expense'),
                Appwrite.Query.limit(500),
            ]
        );
        const totals = {};
        result.documents.forEach(doc => {
            totals[doc.category] = (totals[doc.category] || 0) + doc.amount;
        });
        return totals;
    },
};

/* ─── Budget Service ─── */
const BudgetService = {
    async create(data) {
        const user = await Auth.getUser();
        if (!user) throw new Error('Not authenticated');
        return await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.budgets,
            Appwrite.ID.unique(),
            {
                userId: user.$id,
                category: data.category,
                limitAmount: Math.round(data.limitAmount * 100),
                period: data.period || 'monthly',
                month: data.month,
            },
            [
                Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
                Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
                Appwrite.Permission.delete(Appwrite.Role.user(user.$id)),
            ]
        );
    },

    async list(month) {
        const user = await Auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const queries = [
            Appwrite.Query.equal('userId', user.$id),
            Appwrite.Query.limit(50),
        ];
        if (month) queries.push(Appwrite.Query.equal('month', month));
        return await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.budgets,
            queries
        );
    },

    async update(documentId, data) {
        return await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.budgets,
            documentId,
            data
        );
    },

    async delete(documentId) {
        return await databases.deleteDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.budgets,
            documentId
        );
    },
};

/* ─── Path helpers ─── */
function getPagePath(page) {
    const loc = window.location.pathname;
    return loc.includes('/pages/') ? page : 'pages/' + page;
}

function getRootPath(file) {
    const loc = window.location.pathname;
    return loc.includes('/pages/') ? '../' + file : file;
}
