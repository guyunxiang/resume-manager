import mongoose, { Document, Schema, Model } from 'mongoose';

interface IListItem {
  title: string;
  descriptions: string[];
}

interface IProfile {
  title: string;
  summary?: string;
  list?: IListItem[];
  descriptions?: string[];
}

interface IBasicInfo {
  email: string;
  phone: string;
  address: string;
}

export interface IUser extends Document {
  name: string;
  wallet: string;
  basicInfo: IBasicInfo;
  profiles: IProfile[];
}

const listItemSchema = new Schema<IListItem>({
  title: String,
  descriptions: [String],
});

const profileSchema = new Schema<IProfile>({
  title: String,
  summary: String,
  list: [listItemSchema],
  descriptions: [String],
});

const userSchema = new Schema<IUser>({
  name: String,
  wallet: String,
  basicInfo: [String],
  profiles: [profileSchema],
});

const Profile: Model<IUser> = mongoose.model<IUser>('Profile', userSchema);

export default Profile;
