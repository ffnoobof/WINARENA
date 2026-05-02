class TeamManager {
  constructor() {
    this.teamData = new Map();
  }

  async init() {
    return Promise.resolve();
  }

  validateGuild(guild) {
    if (!guild) {
      throw new Error('Guild is null');
    }
    return guild;
  }

  addTeam(guild, data) {
    this.validateGuild(guild);
    this.teamData.set(guild.id, data);
    return this.teamData.get(guild.id);
  }

  getTeam(guild) {
    this.validateGuild(guild);
    return this.teamData.get(guild.id) ?? null;
  }

  removeTeam(guild) {
    this.validateGuild(guild);
    return this.teamData.delete(guild.id);
  }
}

module.exports = TeamManager;
