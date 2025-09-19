export const transValidation = {
    email_incorrect: "Email không hợp lệ",
    gender_incorrect: "Giới tính không hợp lệ",
    password_incorrect: "Mật khẩu phải có ít nhất 6 ký tự",
    password_confirmation_incorrect: "Mật khẩu xác nhận không chính xác",
};

export const transMailBookingNew = {
    subject: "Thông báo đặt lịch khám tại DoctorCare",
    template: (data) => {
        const startTime = new Date(data.startTime).toLocaleTimeString();
        const endTime = new Date(data.endTime).toLocaleDateString();
        const date = new Date(data.startTime).toLocaleDateString();
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Thông Tin Đặt Lịch Khám</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px;">Thông tin bệnh nhân</h3>
                <div style="margin-bottom: 10px;">
                    <strong>Họ tên:</strong> ${data.name}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Số điện thoại:</strong> ${data.phone}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Email:</strong> ${data.email}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Địa chỉ:</strong> ${data.address}
                </div>
                ${data.description ? `
                <div style="margin-bottom: 10px;">
                    <strong>Mô tả:</strong> ${data.description}
                </div>` : ''}
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px;">Chi tiết lịch khám</h3>
                <div style="margin-bottom: 10px;">
                    <strong>Bác sĩ:</strong> ${data.doctor}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Thời gian:</strong> ${startTime}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Ngày khám:</strong> ${date}
                </div>
                <div style="margin-bottom: 10px; color: #e67e22;">
                    <strong>Trạng thái:</strong> Đang chờ xác nhận
                </div>
            </div>

            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #2c3e50;">
                    Hệ thống DoctorCare sẽ gửi email thông báo khi bác sĩ xác nhận lịch khám.
                    <br/>Xin vui lòng kiểm tra email thường xuyên.
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                <p>Email này được gửi tự động từ Hệ thống DoctorCare.</p>
            </div>
        </div>`;
    },
};

export const transMailBookingFailed = {
    subject: "Thông báo hủy lịch khám tại DoctorCare",
    template: (data) => {
        const startTime = new Date(data.startTime).toLocaleTimeString();
        const endTime = new Date(data.endTime).toLocaleDateString();
        const date = new Date(data.startTime).toLocaleDateString();
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Thông Báo Hủy Lịch Khám</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="margin-bottom: 10px;">
                    <strong>Bác sĩ:</strong> ${data.doctor}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Thời gian:</strong> ${startTime}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Ngày khám:</strong> ${date}
                </div>
                <div style="margin-bottom: 10px; color: #e74c3c;">
                    <strong>Trạng thái:</strong> Đã hủy
                </div>
            </div>

            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #2c3e50;">
                    Rất tiếc lịch khám của bạn đã bị hủy.
                    <br/>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ tổng đài hỗ trợ: <strong>911 911</strong>
                    <br/>Hoặc đặt lịch khám mới trên hệ thống DoctorCare.
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                <p>Email này được gửi tự động từ Hệ thống DoctorCare.</p>
            </div>
        </div>`;
    },
};

export const transMailBookingSuccess = {
    subject: "Xác nhận lịch khám tại DoctorCare",
    template: (data) => {
        const startTime = new Date(data.startTime).toLocaleTimeString();
        const endTime = new Date(data.endTime).toLocaleDateString();
        const date = new Date(data.startTime).toLocaleDateString();
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Xác Nhận Lịch Khám</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="margin-bottom: 10px;">
                    <strong>Bác sĩ:</strong> ${data.doctor}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Thời gian:</strong> ${startTime}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Ngày khám:</strong> ${date}
                </div>
                <div style="margin-bottom: 10px; color: #27ae60;">
                    <strong>Trạng thái:</strong> Đã xác nhận
                </div>
            </div>

            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #2c3e50;">
                    Lịch khám của bạn đã được xác nhận.
                    <br/>Vui lòng đến đúng giờ để được phục vụ tốt nhất.
                    <br/>Nếu bạn cần thay đổi lịch khám, vui lòng liên hệ tổng đài hỗ trợ: <strong>911 911</strong>
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                <p>Email này được gửi tự động từ Hệ thống DoctorCare.</p>
            </div>
        </div>`;
    },
};

export const transMailRemedy = {
    subject: "Hóa đơn khám bệnh từ DoctorCare",
    template: (data) => {
        const startTime = new Date(data.startTime).toLocaleTimeString();
        const startDate = new Date(data.startTime).toLocaleDateString();
        const endTime = new Date(data.endTime).toLocaleTimeString();
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(data.price);

        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Hóa Đơn Khám Bệnh</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px;">Chi Tiết Lịch Khám</h3>
                <div style="margin-bottom: 10px;">
                    <strong>Bác sĩ:</strong> ${data.doctor}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Ngày khám:</strong> ${startDate}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Thời gian:</strong> ${startTime} - ${endTime}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Chi phí khám:</strong> ${formattedPrice}
                </div>
            </div>

            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #2c3e50;">
                    Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của DoctorCare. 
                    Nếu có bất kỳ thắc mắc nào về hóa đơn, vui lòng liên hệ tổng đài hỗ trợ: <strong>911 911</strong>
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                <p>Email này được gửi tự động từ Hệ thống DoctorCare.</p>
            </div>
        </div>`;
    },
};
