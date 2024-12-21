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
		interestedParticipants: [
			{
				type: mongoose.Schema.Types.ObjectId, // Referință către utilizator
				ref: "User",
			},
		],
		goingParticipants: [
			{
				type: mongoose.Schema.Types.ObjectId, // Referință către utilizator
				ref: "User",
			},
		],
	},
	{
		timestamps: true, // Include createdAt și updatedAt
	}
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
