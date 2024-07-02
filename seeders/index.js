const {addSkill}=require('./skillsSeeder');
const runSeeders = async () => {
    await addSkill();
};
module.exports = runSeeders;
