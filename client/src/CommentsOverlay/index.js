import React from 'react';
import './style.scss';

import { Button, Row, Col, Icon, Tabs } from 'antd';

import LoopsIcon from '../LoopsIcon';

import CommentList from '../CommentList';
import LikeList from '../LikeList';

import { kFormatter } from '../utils/Utils';

const { TabPane } = Tabs;

const CommentsOverlay = props => {
	const { post, onClose } = props;
	const { commentCount, likeCount, loopCount } = post;

	const onCloseOverlay = () => {
		if (onClose) {
			onClose();
		}
	};

	return (
		<div className="comments-overlay-container">
			<Row className="comments-overlay-header">
				<Col span={12}>
					<Button className="loops-count">
						<Icon
							component={LoopsIcon}
							style={{
								fontSize: '24px',
								textAlign: 'left'
							}}
						/>
						{`${loopCount.toLocaleString()} Loops`}
					</Button>
				</Col>
				<Col span={12} className="action-buttons-container">
					<Button icon="share-alt" ghost>
						Share
					</Button>
					<Button shape="circle" icon="close" onClick={onCloseOverlay} />
				</Col>
			</Row>
			<Tabs defaultActiveKey="1">
				<TabPane tab={`${kFormatter(commentCount)} Comments`} key="comments">
					<CommentList post={post} onListItemClick={onCloseOverlay} />
				</TabPane>
				<TabPane tab={`${kFormatter(likeCount)} Likes`} key="likes">
					<LikeList post={post} onListItemClick={onCloseOverlay} />
				</TabPane>
			</Tabs>
		</div>
	);
};

export default CommentsOverlay;