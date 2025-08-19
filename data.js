// data.js - 武侠语C群数据管理（LeanCloud版）
const WuxiaData = {
    // LeanCloud应用配置
    appId: "VyHvAvYwC3OEjZ4Vz1swUMPb-gzGzoHsz",
    appKey: "dzvCk8feeA8JL7Y4ZZUViG8J",
    serverURL: "https://vyhvavyw.lc-cn-n1-shared.com",
    
    // 初始化状态标记
    initialized: false,
    
    // 初始化LeanCloud（使用全局AV变量）
    init: function() {
        if (this.initialized) return true;
        
        if (typeof AV === 'undefined') {
            console.error("错误：LeanCloud SDK未加载！");
            throw new Error("LeanCloud SDK未加载");
        }
        
        try {
            AV.init({
                appId: this.appId,
                appKey: this.appKey,
                serverURL: this.serverURL
            });
            console.log("LeanCloud初始化成功");
            this.initialized = true;
            return true;
        } catch (error) {
            console.error("LeanCloud初始化失败:", error);
            throw error;
        }
    },

    // 门派信息
    sects: {
        wudang: { name: "武当派", color: "wudang", position: "带发道童" },
        yaowang: { name: "药王谷", color: "yaowang", position: "药童" },
        yaowanggu: { name: "药王谷", color: "yaowang", position: "药童" },
        chongsheng: { name: "崇圣寺", color: "chongsheng", position: "和尚" },
        xueao: { name: "血敖台", color: "xueao", position: "分舵主" },
        guangming: { name: "光明顶", color: "guangming", position: "圣火童子" },
        wandu: { name: "万毒窟", color: "wandu", position: "蛊奴" },
        emei: { name: "峨眉派", color: "emei", position: "普通弟子" },
        tianxing: { name: "天行道", color: "tianxing", position: "预备役" },
        changtianque: { name: "长天阙", color: "changtianque", position: "神秘人" }
    },

    // 获取当前登录用户
    getCurrentUser: async function() {
        const phone = localStorage.getItem('currentUserPhone');
        if (!phone) return null;
        
        try {
            this.init();
            const Character = AV.Object.extend('Character');
            const query = new AV.Query(Character);
            query.equalTo('phone', phone);
            
            const result = await query.first();
            return result ? result.toJSON() : null;
        } catch (error) {
            console.error("获取用户失败:", error);
            throw error;
        }
    },

    // 获取所有角色
    getAllCharacters: async function() {
        try {
            this.init();
            const Character = AV.Object.extend('Character');
            const query = new AV.Query(Character);
            
            const results = await query.find();
            const characters = {};
            results.forEach(char => {
                const charData = char.toJSON();
                characters[charData.phone] = charData;
            });
            return characters;
        } catch (error) {
            console.error("获取角色列表失败:", error);
            throw error;
        }
    },

    // 保存角色数据
    saveCharacter: async function(phone, data) {
        try {
            this.init();
            const Character = AV.Object.extend('Character');
            
            // 检查是否已存在
            const query = new AV.Query(Character);
            query.equalTo('phone', phone);
            let character = await query.first();
            
            if (character) {
                // 更新现有角色
                Object.keys(data).forEach(key => {
                    character.set(key, data[key]);
                });
            } else {
                // 创建新角色
                character = new Character();
                character.set('phone', phone);
                Object.keys(data).forEach(key => {
                    character.set(key, data[key]);
                });
            }
            
            await character.save();
            return true;
        } catch (error) {
            console.error("保存角色失败:", error);
            throw error;
        }
    },

    // 获取交易数据
    getTradeData: async function() {
        try {
            this.init();
            const Trade = AV.Object.extend('Trade');
            const query = new AV.Query(Trade);
            query.limit(100);
            
            const results = await query.find();
            return {
                trades: results.map(trade => trade.toJSON()),
                lastCleanDate: new Date().toISOString().split('T')[0]
            };
        } catch (error) {
            console.error("获取交易数据失败:", error);
            return { trades: [], lastCleanDate: new Date().toISOString().split('T')[0] };
        }
    },

    // 保存交易记录
    saveTrade: async function(trade) {
        try {
            this.init();
            const Trade = AV.Object.extend('Trade');
            const tradeObj = new Trade();
            
            Object.keys(trade).forEach(key => {
                tradeObj.set(key, trade[key]);
            });
            
            await tradeObj.save();
            return true;
        } catch (error) {
            console.error("保存交易失败:", error);
            throw error;
        }
    },

    // 更新交易状态
    updateTradeStatus: async function(tradeId, status) {
        try {
            this.init();
            const trade = AV.Object.createWithoutData('Trade', tradeId);
            
            trade.set('status', status);
            trade.set('responseTime', new Date().toISOString());
            
            await trade.save();
            return true;
        } catch (error) {
            console.error("更新交易状态失败:", error);
            throw error;
        }
    },

    // 获取江湖传闻
    getRumors: async function(level) {
        try {
            this.init();
            const Rumor = AV.Object.extend('Rumor');
            const query = new AV.Query(Rumor);
            
            if (level) query.equalTo('level', level);
            query.limit(50);
            query.descending('createdAt');
            
            const results = await query.find();
            return results.map(rumor => rumor.toJSON());
        } catch (error) {
            console.error("获取传闻失败:", error);
            return [];
        }
    },

    // 创建新传闻
    createRumor: async function(rumor) {
        try {
            this.init();
            const Rumor = AV.Object.extend('Rumor');
            const rumorObj = new Rumor();
            
            Object.keys(rumor).forEach(key => {
                rumorObj.set(key, rumor[key]);
            });
            
            await rumorObj.save();
            return true;
        } catch (error) {
            console.error("创建传闻失败:", error);
            throw error;
        }
    },

    // 计算战斗力（示例逻辑）
    calculatePower: function(character) {
        if (!character) return 0;
        
        const skillBonus = {
            basic: 0, 
            intermediate: 300, 
            advanced: 800, 
            legendary: 1500
        };
        
        const randomSkill = ["basic", "intermediate", "advanced", "legendary"][
            Math.floor(Math.random() * 4)
        ];
        
        return (character.exp || 0) + (skillBonus[randomSkill] || 0);
    },

    // 检查LeanCloud SDK是否可用
    isSDKAvailable: function() {
        return typeof AV !== 'undefined';
    },

    // 重置初始化状态（用于测试或重新加载）
    reset: function() {
        this.initialized = false;
    }
};

// 暴露到全局
if (typeof window !== 'undefined') {
    window.WuxiaData = WuxiaData;
}