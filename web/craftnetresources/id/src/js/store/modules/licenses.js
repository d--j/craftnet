import Vue from 'vue'
import Vuex from 'vuex'
import licensesApi from '../../api/licenses';

Vue.use(Vuex)
Vue.use(require('vue-moment'))

var VueApp = new Vue();

/**
 * State
 */
const state = {
    cmsLicenses: [],
    pluginLicenses: [],
}

/**
 * Getters
 */
const getters = {

    expiresSoon(state) {
        return license => {
            if(!license.expiresOn) {
                return false
            }

            const today = new Date()
            let expiryDate = new Date()
            expiryDate.setDate(today.getDate() + 45)

            const expiresOn = new Date(license.expiresOn.date)

            if(expiryDate > expiresOn) {
                return true
            }

            return false
        }
    },

    daysBeforeExpiry(state) {
        return license => {
            const today = new Date()
            const expiresOn = new Date(license.expiresOn.date)
            const diff = expiresOn.getTime() - today.getTime()
            const diffDays = Math.round(diff / (1000 * 60 * 60 * 24))
            return diffDays;
        }
    },

    expiringCmsLicenses(state, getters) {
        return state.cmsLicenses.filter(license => {
            if (license.expired) {
                return false
            }

            if (license.autoRenew) {
                return false
            }
            
            return getters.expiresSoon(license)
        })
    },

    expiringPluginLicenses(state, getters) {
        return state.pluginLicenses.filter(license => {
            if (license.expired) {
                return false
            }

            if (license.autoRenew) {
                return false
            }

            return getters.expiresSoon(license)
        })
    },

    renewableLicenses(state) {
        return (license, renew) => {
            let renewableLicenses = []

            // CMS license

            renewableLicenses.push({
                description: 'Craft ' + license.editionDetails.name,
                expiresOn: license.expiresOn,
                edition: license.editionDetails,
            })


            // Plugin licenses

            if(license.pluginLicenses.length > 0) {
                let renewablePluginLicenses = license.pluginLicenses.filter(license => !!license.key)

                const cmsExpiresOn = VueApp.$moment(license.expiresOn.date)
                let cmsNewExpiresOn = cmsExpiresOn.add(renew, 'years')

                renewablePluginLicenses = state.pluginLicenses.filter(license => {
                    const pluginExpiresOn = VueApp.$moment(license.expiresOn.date)
                    if(pluginExpiresOn > cmsNewExpiresOn) {
                        return false
                    }
                    return renewablePluginLicenses.find(renewablePluginLicense => renewablePluginLicense.id === license.id)
                })

                renewablePluginLicenses.forEach(function(renewablePluginLicense) {
                    renewableLicenses.push({
                        description: renewablePluginLicense.plugin.name,
                        expiresOn: renewablePluginLicense.expiresOn,
                        edition: renewablePluginLicense.edition,
                    })
                }.bind(this))
            }

            return renewableLicenses
        }
    },


    newExpiresOn() {
        return (license, renew) => {
            const cmsExpiresOn = VueApp.$moment(license.expiresOn.date)
            return cmsExpiresOn.add(renew, 'years')
        }
    },

    renewableLicensesTotal(state, getters) {
        return (license, renew, checkedLicenses) => {
            let total = 0

            getters.renewableLicenses(license, renew).forEach(function(renewableLicense, key) {
                const isChecked = checkedLicenses[key]

                if (isChecked) {
                    total += getters.newExpiresOn(license, renew).diff(renewableLicense.expiresOn.date, 'years', true) * renewableLicense.edition.renewalPrice
                }
            })

            return total
        }
    }

}

/**
 * Actions
 */
const actions = {

    claimCmsLicense({commit}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.claimCmsLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    claimCmsLicenseFile({commit}, licenseFile) {
        return new Promise((resolve, reject) => {
            licensesApi.claimCmsLicenseFile(licenseFile, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    claimLicensesByEmail({commit}, email) {
        return new Promise((resolve, reject) => {
            licensesApi.claimLicensesByEmail(email, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    claimPluginLicense({commit}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.claimPluginLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    getCmsLicenses({commit}) {
        return new Promise((resolve, reject) => {
            licensesApi.getCmsLicenses(response => {
                if (response.data && !response.data.error) {
                    commit('updateCmsLicenses', {cmsLicenses: response.data});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    getPluginLicenses({commit}) {
        return new Promise((resolve, reject) => {
            licensesApi.getPluginLicenses(response => {
                if (response.data && !response.data.error) {
                    commit('receivePluginLicenses', {pluginLicenses: response.data});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    releaseCmsLicense({commit}, licenseKey) {
        return new Promise((resolve, reject) => {
            licensesApi.releaseCmsLicense(licenseKey, response => {
                if (response.data && !response.data.error) {
                    commit('releaseCmsLicense', {licenseKey});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    releasePluginLicense({commit}, {pluginHandle, licenseKey}) {
        return new Promise((resolve, reject) => {
            licensesApi.releasePluginLicense({pluginHandle, licenseKey}, response => {
                if (response.data && !response.data.error) {
                    commit('releasePluginLicense', {licenseKey});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    saveCmsLicense({commit}, license) {
        return new Promise((resolve, reject) => {
            licensesApi.saveCmsLicense(license, response => {
                if (response.data && !response.data.error) {
                    commit('saveCmsLicense', { license: response.data.license });
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

    savePluginLicense({commit}, license) {
        return new Promise((resolve, reject) => {
            licensesApi.savePluginLicense(license, response => {
                if (response.data && !response.data.error) {
                    commit('savePluginLicense', {license});
                    resolve(response);
                } else {
                    reject(response);
                }
            }, response => {
                reject(response);
            })
        })
    },

}

/**
 * Mutations
 */
const mutations = {

    updateCmsLicenses(state, {cmsLicenses}) {
        state.cmsLicenses = cmsLicenses;
    },

    receivePluginLicenses(state, {pluginLicenses}) {
        state.pluginLicenses = pluginLicenses;
    },

    releaseCmsLicense(state, {licenseKey}) {
        state.cmsLicenses.find((l, index, array) => {
            if (l.key === licenseKey) {
                array.splice(index, 1);
                return true;
            }

            return false;
        });
    },

    releasePluginLicense(state, {licenseKey}) {
        state.pluginLicenses.find((l, index, array) => {
            if (l.key === licenseKey) {
                array.splice(index, 1);
                return true;
            }

            return false;
        });
    },

    saveCmsLicense(state, {license}) {
        let stateLicense = state.cmsLicenses.find(l => l.key == license.key);
        for (let attribute in license) {
            switch(attribute) {
                case 'autoRenew':
                    stateLicense[attribute] = license[attribute] === 1 || license[attribute] === '1' ? true : false
                    break
                default:
                    stateLicense[attribute] = license[attribute];
            }
        }
    },

    savePluginLicense(state, {license}) {
        let stateLicense = state.pluginLicenses.find(l => l.key == license.key);
        for (let attribute in license) {
            switch(attribute) {
                case 'autoRenew':
                    stateLicense[attribute] = license[attribute] === 1 || license[attribute] === '1' ? true : false
                    break
                default:
                    stateLicense[attribute] = license[attribute];
            }
        }
    },

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
