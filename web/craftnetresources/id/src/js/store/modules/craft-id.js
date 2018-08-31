import Vue from 'vue'
import Vuex from 'vuex'
import craftIdApi from '../../api/craft-id';

Vue.use(Vuex)

/**
 * State
 */
const state = {
    categories: [],
    countries: [],
}

/**
 * Getters
 */
const getters = {

}

/**
 * Actions
 */
const actions = {

    getCraftIdData({commit}) {
        return new Promise((resolve, reject) => {
            craftIdApi.getCraftIdData(response => {
                    commit('updateCategories', {categories: response.data.categories});
                    commit('updateCountries', {countries: response.data.countries});

                    commit('developers/updateHasApiToken', {hasApiToken: response.data.currentUser.hasApiToken}, {root: true});
                    commit('developers/updatePlugins', {plugins: response.data.plugins}, {root: true});
                    commit('developers/updateSales', {sales: response.data.sales}, {root: true});

                    commit('licenses/updateCmsLicenses', {cmsLicenses: response.data.cmsLicenses}, {root: true});
                    commit('licenses/receivePluginLicenses', {pluginLicenses: response.data.pluginLicenses}, {root: true});

                    commit('account/updateUpcomingInvoice', {upcomingInvoice: response.data.upcomingInvoice}, {root: true});
                    commit('account/updateApps', {apps: response.data.apps}, {root: true});
                    commit('account/updateCurrentUser', {currentUser: response.data.currentUser}, {root: true});
                    commit('account/updateBillingAddress', {billingAddress: response.data.billingAddress}, {root: true});
                    commit('account/updateCard', {card: response.data.card}, {root: true});

                    resolve(response);
                },
                response => {
                    reject(response);
                })
        })
    },

}

/**
 * Mutations
 */
const mutations = {

    updateCategories(state, {categories}) {
        state.categories = categories;
    },

    updateCountries(state, {countries}) {
        state.countries = countries;
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
