import React from 'react';

import { connect } from 'react-redux';

import {
	authenticate,
	setSignupModalVisibility,
	setGoogleToken
} from '../authActions';

import { Modal, Form, Input, Button, Icon, Alert } from 'antd';

import AnalyticsUtil from '../../utils/AnalyticsUtil';

class LoginModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getInitialState();
	}

	getInitialState = () => {
		return {
			loading: false,
			errorMessageText: null
		};
	};

	handleSubmit = e => {
		const { form, authenticate, setGoogleToken } = this.props;

		e.preventDefault();

		form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				this.setState({ loading: true });

				authenticate(values).then(response => {
					this.setState({ loading: false });

					const { error, googleToken } = response;

					if (error) {
						// set Google token in Redux so SignupModal can use it in register call
						setGoogleToken(googleToken);
						this.handleError(error);
					} else {
						AnalyticsUtil.track('Login');
					}
				});
			}
		});
	};

	handleError = error => {
		const { setSignupModalVisibility } = this.props;
		const { code } = error;

		switch (code) {
			case 1300:
				this.setState({
					errorMessageText: 'The Google code you provided was invalid.'
				});
				break;
			case 1305:
				setSignupModalVisibility(true);
				this.onCancel();
				break;
			default:
				this.setState({
					errorMessageText: 'There was an unknown error.'
				});
		}
	};

	onCancel = () => {
		const { onClose } = this.props;

		this.resetModal();

		if (onClose) {
			onClose();
		}
	};

	resetModal = () => {
		const { form } = this.props;

		this.setState(this.getInitialState());

		form.setFieldsValue({ code: '' });
	};

	render() {
		const { isOpen, form } = this.props;
		const { getFieldDecorator } = form;
		const { loading, errorMessageText } = this.state;

		return (
			<Modal
				visible={isOpen}
				title="Login to byte"
				centered
				footer={null}
				onCancel={this.onCancel}
			>
				<Form onSubmit={this.handleSubmit}>
					{errorMessageText !== null && (
						<Alert message={errorMessageText} type="error" />
					)}

					<Alert
						message={
							<span>
								Notice: We will securely sign you in to byte but please be aware
								that we are a 3rd party website and aren't officially endorsed
								by byte.
								<br />
								<br />
								The code for this website is{' '}
								<a
									href="https://github.com/CaliAlec/Byte-Community"
									target="_blank"
									rel="noopener noreferrer"
								>
									open source on GitHub
								</a>{' '}
								and you can trust us with your account, but please be careful
								about giving your byte info to any 3rd parties.
								<br />
								<br />
								You can view Dom's advice on the official byte forums{' '}
								<a
									href="https://community.byte.co/t/important-note-about-unofficial-websites/47684"
									target="_blank"
									rel="noopener noreferrer"
								>
									here
								</a>
								.
							</span>
						}
						type="warning"
					/>

					<div style={{ marginTop: '15px' }}>
						<h3>Please paste the code that Google asked you to copy:</h3>

						<Form.Item>
							{getFieldDecorator('code', {
								rules: [
									{
										required: true,
										message: 'Code cannot be empty.'
									},
									{
										pattern: new RegExp('^4/'),
										message: 'Invalid code format.'
									}
								]
							})(
								<Input
									prefix={
										<Icon type="google" style={{ color: 'rgba(0,0,0,.25)' }} />
									}
									placeholder="Code"
									size="large"
								/>
							)}
						</Form.Item>

						<Form.Item>
							<Button
								block
								size="large"
								type="primary"
								htmlType="submit"
								loading={loading}
							>
								Login
							</Button>
						</Form.Item>
					</div>
				</Form>
			</Modal>
		);
	}
}

const WrappedForm = Form.create({ name: 'login' })(LoginModal);

export default connect(null, {
	authenticate,
	setSignupModalVisibility,
	setGoogleToken
})(WrappedForm);
