import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		date: {
			type: Date,
			required: true,
		},
		coverImage: {
			type: String, 
			default: "", 
		},
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId, 
				ref: "User", 
			},
		],
	},
	{
		timestamps: true, 
	}
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
