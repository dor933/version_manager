import { DataTypes } from "sequelize";

export const TimeUnits = {
 
    UnitOfTime: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Day', 'Week', 'Month']]
        },
        primaryKey: true
    },

    LastUpdate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}

export const TimeUnits_Model = TimeUnits;
